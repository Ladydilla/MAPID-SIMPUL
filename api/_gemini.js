const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export function readJson(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body || {};
}

export function reply(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

export function cleanText(value, max = 2400) {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, max) : '';
}

export function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-6).map(item => ({
    role: item?.role === 'model' ? 'model' : 'user',
    text: cleanText(item?.text, 1000)
  })).filter(item => item.text);
}

export async function generate({ systemInstruction, contents, generationConfig = {} }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error('GEMINI_API_KEY belum disetel di environment server.'), { status: 503 });

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const response = await fetch(`${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: 'high' },
      ...generationConfig
    }     
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || 'Layanan AI tidak dapat dihubungi.';
    throw Object.assign(new Error(message), { status: response.status });
  }
  const text = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
  if (!text) throw Object.assign(new Error('AI tidak mengembalikan jawaban.'), { status: 502 });
  return text;
}
