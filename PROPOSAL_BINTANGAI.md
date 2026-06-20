# PROPOSAL INOVASI TEKNOLOGI PENDIDIKAN NASIONAL

**Tema:** Pendidikan & Pembelajaran Kreatif: Inovasi untuk meningkatkan kualitas pembelajaran, literasi, akses pendidikan, serta pengembangan media edukasi interaktif.

---

## HALAMAN SAMPUL

**JUDUL PROGRAM:**
### BintangAi: Platform Pembelajaran Inklusif Berbasis Kecerdasan Buatan (AI) untuk Kesetaraan Akses Pendidikan bagi Siswa Disabilitas

**Diusulkan Oleh:**
Tim BintangAi

---

## I. LATAR BELAKANG

Pendidikan merupakan hak fundamental setiap warga negara, termasuk bagi mereka yang memiliki keterbatasan fisik atau disabilitas. Namun, di Indonesia, akses terhadap materi pendidikan yang inklusif masih sangat terbatas. Siswa dengan hambatan sensorik seperti Tunanetra, Tunarungu, dan Tunawicara seringkali menghadapi dinding pemisah dalam proses belajar-mengajar konvensional.

Permasalahan utama yang ditemukan di lapangan meliputi:
1. **Kesenjangan Literasi Digital:** Kurangnya alat bantu yang mampu menerjemahkan konten visual menjadi audio (untuk tunanetra) atau suara menjadi teks/visual (untuk tunarungu) secara *real-time*.
2. **Ketergantungan pada Pendamping:** Siswa disabilitas seringkali sulit belajar secara mandiri karena materi ajar yang tidak adaptif.
3. **Kurangnya Interaksi Kreatif:** Media pembelajaran untuk disabilitas cenderung statis dan membosankan, tidak memanfaatkan potensi interaksi modern seperti gestur atau suara.

BintangAi hadir sebagai solusi inovatif yang memanfaatkan *Artificial Intelligence* (AI) untuk menghancurkan batasan-batasan tersebut, menciptakan lingkungan belajar yang adaptif, mandiri, dan inklusif.

## II. IDE & INOVASI

**BintangAi** adalah ekosistem pembelajaran cerdas yang dirancang untuk menjadi "jembatan" antara materi pendidikan dan kebutuhan spesifik siswa disabilitas. Berbeda dengan aplikasi edukasi umum, BintangAi menempatkan *Accessibility-First* sebagai filosofi desain utama.

**Inovasi Utama:**
- **AI-Tutor (Kak Bintang):** Asisten virtual yang tidak hanya menjawab pertanyaan, tetapi mampu memahami konteks hambatan pengguna.
- **Multi-Modal Interaction:** Integrasi *Computer Vision* untuk deteksi gestur (tangan) sebagai alat navigasi bagi tunarungu/tunawicara, serta *Speech Recognition* yang canggih untuk tunanetra.
- **Dynamic Content Adaptation:** Sistem yang mampu mengubah dokumen PDF/teks menjadi narasi suara atau deskripsi yang mudah dipahami secara otomatis melalui teknologi RAG (*Retrieval Augmented Generation*).

## III. TUJUAN DAN MANFAAT

### 3.1 Tujuan
1. Menyediakan platform pembelajaran yang dapat diakses oleh semua siswa tanpa memandang keterbatasan fisik.
2. Meningkatkan kemandirian belajar siswa disabilitas melalui bantuan asisten AI.
3. Membantu guru dalam mendistribusikan materi ajar yang otomatis teradaptasi dengan kebutuhan siswa.

### 3.2 Manfaat
- **Bagi Siswa:** Akses materi tanpa batas, peningkatan kepercayaan diri, dan pengalaman belajar yang lebih interaktif.
- **Bagi Guru:** Kemudahan monitoring perkembangan siswa secara inklusif melalui dashboard khusus.
- **Bagi Masyarakat:** Berkontribusi pada pencapaian *Sustainable Development Goals* (SDG) Goal 4: Pendidikan Berkualitas yang Inklusif.

## IV. BATASAN APLIKASI

Agar pengembangan fokus dan optimal, batasan aplikasi ditetapkan sebagai berikut:
1. **Target Pengguna:** Siswa tingkat SD hingga SMA dengan kategori disabilitas Tunanetra, Tunarungu, dan Tunawicara.
2. **Platform:** Aplikasi berbasis web (PWA) yang responsif untuk perangkat desktop maupun tablet/smartphone.
3. **Materi:** Fokus pada materi kurikulum nasional yang dapat diunggah dalam format teks atau PDF.
4. **Bahasa:** Mendukung Bahasa Indonesia sebagai bahasa utama instruksi dan interaksi AI.

## V. METODOLOGI PENGEMBANGAN SOFTWARE

Kami menggunakan metodologi **Agile Software Development** dengan kerangka kerja **Scrum**. Hal ini memungkinkan kami untuk melakukan iterasi cepat berdasarkan feedback dari komunitas disabilitas.

1. **Requirements Gathering:** Melakukan wawancara dengan siswa di Sekolah Luar Biasa (SLB).
2. **UI/UX Design:** Pembuatan prototype di Figma dengan standar WCAG 2.1 (*Web Content Accessibility Guidelines*).
3. **Sprints:** Pengembangan fitur dalam siklus 2 mingguan.
4. **Testing:** Melakukan *Usability Testing* langsung dengan pengguna disabilitas untuk memastikan aksesibilitas (misal: penggunaan screen reader).
5. **Deployment:** Menggunakan layanan cloud (Vercel) untuk ketersediaan tinggi.

## VI. ANALISIS DESAIN SOFTWARE

### 6.1 Teknologi yang Digunakan
- **Frontend:** React.js 18 & Vite (Performa tinggi, SEO-friendly).
- **Styling:** Tailwind CSS & Framer Motion (Antarmuka responsif dan aksesibilitas animasi).
- **Backend/Database:** Supabase (PostgreSQL, Realtime, Storage).
- **AI Engine:** 
    - Supabase Edge Functions (Deno runtime).
    - Integrasi LLM (Large Language Models) untuk tutor cerdas.
    - MediaPipe (Google) untuk hand tracking & gesture recognition.
- **State Management:** Zustand (Ringan).

### 6.2 Fitur & Cara Kerja
1. **Modul Mata Pintar (Tunarungu/Tunawicara):**
   - Kamera mendeteksi gerakan tangan siswa.
   - Algoritma AI menerjemahkan gestur menjadi perintah aplikasi (misal: "Buka materi selanjutnya").
   - Transkripsi suara guru secara real-time ke teks subtitle.
2. **Asisten Nay (Tunanetra):**
   - Aktivasi melalui perintah suara ("Halo Nay").
   - AI membaca struktur halaman dan isi materi menggunakan TTS (*Text-to-Speech*) yang natural.
   - Navigasi berbasis suara penuh (Voice-to-Action).
3. **Smart PDF Reader:**
   - Materi yang diunggah diproses melalui RAG agar AI dapat menjelaskan isi dokumen secara spesifik saat ditanya oleh siswa.

### 6.3 Panduan Singkat Instalasi
Produk ini dirancang untuk kemudahan akses (Zero-Install).
1. Buka browser pada perangkat.
2. Akses tautan produksi (Live Demo).
3. Untuk pemasangan di HP (Android/iOS), klik "Add to Home Screen" melalui menu browser karena aplikasi mendukung PWA.

*(Catatan: Tangkapan Layar Mockup disertakan dalam dokumen lampiran visual terpisah)*

## VII. KESIMPULAN & DAFTAR PUSTAKA

### 7.1 Kesimpulan
BintangAi bukan sekadar aplikasi, melainkan komitmen untuk mewujudkan demokratisasi pendidikan. Dengan integrasi AI yang humanis, kami yakin dapat meningkatkan kualitas hidup dan literasi anak-anak luar biasa di Indonesia, memastikan "No One Left Behind" dalam era digital.

### 7.2 Daftar Pustaka
- World Health Organization. (2023). *Disability and Health*.
- Kemdikbud Ristek. (2022). *Panduan Pembelajaran Inklusif*.
- Nielsen, J. (2020). *Usability Engineering*.
- Documentation: React, Supabase, MediaPipe, OpenAI.

---

## LAMPIRAN WAJIB

1. **Tautan Repositori Kode:** [https://github.com/bintangainya/bintangainya](https://github.com/bintangainya/bintangainya)
2. **Tautan Live Demo:** [https://bintangai.vercel.app](https://bintangai.vercel.app) *(Placeholder - Sesuai Deployment)*
3. **Tautan Berkas Aplikasi (.APK):** [Tersedia via PWA / Download Link Here]
4. **Tautan Prototype Interaktif (Figma):** [https://www.figma.com/file/bintangai-prototype](https://www.figma.com/file/bintangai-prototype) *(Placeholder)*

---

### ANALISIS KRITERIA PENILAIAN (Internal Review)

| Kriteria | Skor Maks | Narasi Pendukung |
| :--- | :---: | :--- |
| **Orisinalitas & Urgensi** | 20% | Fokus pada multi-disabilitas (bukan hanya satu jenis) & penggunaan integrasi gestur + suara yang jarang ada di platform lokal. |
| **Inovasi & Dampak** | 20% | Penggunaan RAG untuk materi PDF dan AI Tutor adaptif memberikan kemandirian penuh bagi siswa. |
| **Kelengkapan Teknis** | 15% | Arsitektur modern (React, Supabase, Edge Functions) dijelaskan dengan struktur yang rapi. |
| **Kualitas UI/UX** | 20% | Mengacu pada standar aksesibilitas WCAG 2.1 (Contrast, Screen Reader friendly). |
| **Fungsionalitas & Kode** | 25% | Penggunaan *Clean Code* di frontend dan sistem backend real-time yang stabil. |
