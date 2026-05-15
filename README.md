# BintangAi 🌟

BintangAi adalah platform pembelajaran berbasis kecerdasan buatan (AI) yang dirancang khusus untuk membantu siswa dengan kebutuhan khusus, termasuk **Tunanetra**, **Tunarungu**, dan **Tunawicara**. Proyek ini menggunakan teknologi AI mutakhir untuk menciptakan pengalaman belajar yang inklusif dan interaktif.

## 🚀 Teknologi Utama
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS & Framer Motion (untuk animasi profesional)
- **Backend/Database**: Supabase (Database, Auth, Edge Functions)
- **AI Models**: Integrasi dengan berbagai model AI melalui Supabase Edge Functions.

## 📁 Struktur Folder Proyek
```text
bintangainya/
├── backend/                # Logika server-side dan database migrations
├── public/                 # Aset statis (gambar, ikon, dll)
├── src/
│   ├── components/         # Komponen UI global (Layout, Feedback, dll)
│   ├── features/           # Modul fitur utama
│   │   ├── accessibility/  # Kontrol gestur, panduan suara, dan subtitle
│   │   ├── ai-tutor/       # Integrasi chatbot AI (Kak Bintang & Nay)
│   │   └── auth/           # Logika autentikasi dan manajemen user
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Konfigurasi library eksternal (Supabase, dll)
│   ├── pages/              # Halaman aplikasi berdasarkan peran
│   │   ├── auth/           # Login & Register
│   │   ├── landing/        # Halaman depan (Landing Page)
│   │   ├── parent/         # Dashboard Orang Tua
│   │   ├── profile/        # Manajemen profil user
│   │   ├── student/        # Fitur Siswa (Tanya AI, Quiz, Materi)
│   │   └── teacher/        # Dashboard Guru (Upload Modul, Buat Tugas)
│   ├── styles/             # File CSS global
│   ├── utils/              # Fungsi utilitas pembantu
│   ├── App.jsx             # Router dan struktur utama aplikasi
│   └── main.jsx            # Entry point aplikasi
├── .env                    # Variabel lingkungan (API Keys)
├── package.json            # Dependensi dan scripts proyek
├── tailwind.config.js      # Konfigurasi Tailwind CSS
└── vercel.json             # Konfigurasi deployment ke Vercel
```

## ✨ Fitur Unggulan
- **Tanya AI (Kak Bintang)**: Chatbot interaktif untuk siswa Tunarungu & Tunawicara dengan desain modern dan responsif.
- **Asisten Nay**: Panduan navigasi suara khusus untuk siswa Tunanetra.
- **Mata Pintar AI**: Konversi suara ke teks secara langsung untuk membantu siswa Tunarungu.
- **Gesture Control**: Navigasi aplikasi menggunakan gerakan tangan melalui kamera.
- **Library Materi**: Akses modul PDF dengan bantuan asisten AI yang dapat menjawab pertanyaan seputar materi tersebut.

## 🛠️ Instalasi
1. Clone repositori:
   ```bash
   git clone https://github.com/username/bintangainya.git
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan di mode pengembangan:
   ```bash
   npm run dev
   ```

## 🌐 Deployment
Proyek ini dikonfigurasi untuk dideploy ke [Vercel](https://vercel.com). Pastikan semua variabel lingkungan (`.env`) telah diatur di dashboard Vercel Anda.
