# Database Migrations - BintangAi

Folder ini berisi file migrasi SQL untuk mengelola skema database Supabase secara terstruktur.

## Daftar Migrasi Saat Ini
- `000_initial_schema.sql`: Berisi struktur tabel awal (Profiles, Modules, Quizzes, dll), RLS policies, dan fungsi trigger dasar.

## Cara Menggunakan
Jika Anda ingin menerapkan migrasi ini ke database lokal atau remote, gunakan Supabase CLI:

```bash
# Untuk sinkronisasi lokal
supabase migration up

# Untuk membuat migrasi baru
supabase migration new nama_migrasi_baru
```

## Catatan Penting
- Jangan mengedit file migrasi yang sudah ada (terutama yang sudah di-push).
- Gunakan penomoran tiga digit (misal: `001_xxx.sql`) untuk memastikan urutan eksekusi yang benar.
