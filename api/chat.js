import { cleanHistory, cleanText, generate, readJson, reply } from './_gemini.js';

const SYSTEM = `Anda adalah Asisten SIMPUL, pendamping WebGIS prioritas simpul transit Kota Bandung.
Jawab dalam bahasa Indonesia yang ringkas, profesional, dan mudah dipahami perencana transportasi.
Gunakan HANYA konteks data yang dikirim aplikasi. Jangan mengarang angka, survei, sumber, atau kondisi lapangan.
PIZ menentukan urutan prioritas; strategi ditentukan oleh tipologi, gap, akses, RDTR, dan bukti lapangan bila tersedia.
Tandai keterbatasan dengan jelas: bila bukti lapangan tidak tersedia, sebutkan bahwa kesimpulan bersandar pada hasil model.
Jangan memberi instruksi keselamatan, hukum, atau klaim kebijakan yang tidak ada pada konteks.
Format jawaban dengan paragraf pendek atau poin bila membantu.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Gunakan POST.' });
  try {
    const body = readJson(req);
    const message = cleanText(body.message);
    if (!message) return reply(res, 400, { error: 'Pesan tidak boleh kosong.' });

    const context = body.context && typeof body.context === 'object' ? body.context : {};
    const history = cleanHistory(body.history);
    const contextText = JSON.stringify(context).slice(0, 12000);
    const contents = [
      { role: 'user', parts: [{ text: `KONTEKS WEBGIS (sumber tunggal):\n${contextText}` }] },
      { role: 'model', parts: [{ text: 'Saya akan memakai konteks WebGIS tersebut dan menyatakan keterbatasan buktinya.' }] },
      ...history.map(item => ({ role: item.role, parts: [{ text: item.text }] })),
      { role: 'user', parts: [{ text: message }] }
    ];
    const answer = await generate({ systemInstruction: SYSTEM, contents });
    return reply(res, 200, { answer });
  } catch (error) {
    console.error('SIMPUL chat error:', error);
    return reply(res, error.status || 500, { error: error.status === 429 ? 'Batas permintaan AI tercapai. Coba lagi sebentar.' : 'Asisten belum dapat menjawab. Coba lagi.' });
  }
}
