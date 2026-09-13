import { cleanText, generate, readJson, reply } from './_gemini.js';

const SYSTEM = `Anda adalah mesin diagnosis SIMPUL. Ekstrak hanya fakta yang tersurat dari narasi survei dan konteks kawasan.
Jangan menyimpulkan hambatan yang tidak didukung data. Jika tidak ada bukti, tulis "tidak cukup bukti".
Keluarkan JSON valid sesuai skema yang diminta, tanpa Markdown.`;

const schema = {
  type: 'object',
  properties: {
    hambatan: { type: 'array', items: { type: 'string' } },
    keparahan: { type: 'string', enum: ['rendah', 'sedang', 'tinggi', 'tidak cukup bukti'] },
    konteksWaktu: { type: 'string' },
    pemeriksaanIsochrone: { type: 'string' },
    diagnosis: { type: 'string' },
    rekomendasi: { type: 'array', items: { type: 'string' } },
    dasarBukti: { type: 'string' }
  },
  required: ['hambatan', 'keparahan', 'konteksWaktu', 'pemeriksaanIsochrone', 'diagnosis', 'rekomendasi', 'dasarBukti']
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Gunakan POST.' });
  try {
    const body = readJson(req);
    const area = body.area && typeof body.area === 'object' ? body.area : {};
    const survey = Array.isArray(body.survey) ? body.survey.slice(0, 12) : [];
    const prompt = `KONTEKS KAWASAN:\n${JSON.stringify(area).slice(0, 7000)}\n\nNARASI SURVEI:\n${JSON.stringify(survey).slice(0, 7000)}\n\nEkstrak diagnosis.`;
    const text = await generate({
      systemInstruction: SYSTEM,
      contents: [{ role: 'user', parts: [{ text: cleanText(prompt, 14000) }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.1, maxOutputTokens: 1800 }
    });
    return reply(res, 200, { diagnosis: JSON.parse(text) });
  } catch (error) {
    console.error('SIMPUL diagnosis error:', error);
    return reply(res, error instanceof SyntaxError ? 502 : (error.status || 500), { error: 'Diagnosis AI belum dapat diproses.' });
  }
}
