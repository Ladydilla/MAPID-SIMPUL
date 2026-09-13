# SIMPUL WebGIS + Asisten AI

WebGIS ini memakai Vercel Serverless Functions agar kunci Gemini tidak pernah dikirim ke browser.

## Menjalankan lokal

1. Instal Vercel CLI bila belum ada: `npm i -g vercel`.
2. Pastikan `.env.local` berisi `GEMINI_API_KEY` dan `GEMINI_MODEL`.
3. Dari folder ini, jalankan: `vercel dev`.
4. Buka URL lokal yang ditampilkan Vercel. Jangan membuka `index.html` langsung bila ingin chatbot aktif, karena endpoint `/api/chat` harus berjalan dari server.

## Deploy ke Vercel

1. Buat project Vercel dari folder/repository ini.
2. Tambahkan Environment Variables berikut pada project Vercel:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-3.6-flash`
3. Deploy dengan `vercel --prod` atau melalui integrasi GitHub.

## Endpoint

- `POST /api/chat` - chatbot WebGIS. Konteksnya dibatasi pada kawasan yang sedang dipilih.
- `POST /api/diagnose` - ekstraksi diagnosis terstruktur dari narasi survei dan konteks kawasan.

Kedua endpoint membatasi keluaran AI pada konteks yang dikirim, dan mewajibkan AI menyebutkan ketika bukti lapangan tidak tersedia.
