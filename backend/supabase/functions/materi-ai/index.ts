import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";
import { getAdminClient } from "../_shared/clients/supabase.ts";

/**
 * MATERI AI SERVICE - BintangAi Professional
 * Fokus: Akurasi Tinggi, Hemat Token, Profesionalisme.
 *
 * Model yang diizinkan sesuai instruksi:
 * - qwen/qwen3-32b (Primary for logic)
 * - llama-3.3-70b-versatile (Best for context)
 * - groq/compound (Balanced)
 * - llama-3.1-8b-instant (Fast/Cheap)
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const clientApiKey = req.headers.get("x-api-key");
    const serverApiKey = Deno.env.get("CUSTOM_AI_TUTOR_KEY") || "christian";

    if (!clientApiKey || clientApiKey !== serverApiKey) {
      return sendError("Unauthorized: Invalid API Key", 401);
    }

    const { question, content, module_id, grade_level, model_preference } = await req.json();

    if (!question) return sendError("Pertanyaan tidak boleh kosong.", 400);

    let moduleContent = content || "";
    let moduleTitle = "Materi Pelajaran";

    // OTOMATISASI: Fetch data langsung dari Supabase Database
    if (module_id) {
      try {
        const supabase = getAdminClient();
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('title, content')
          .eq('id', module_id)
          .single();

        if (!moduleError && moduleData) {
          moduleContent = moduleData.content || moduleContent;
          moduleTitle = moduleData.title || moduleTitle;
        }
      } catch (dbErr) {
        console.warn("Supabase fetch warning:", dbErr);
      }
    }

    if (!moduleContent) {
      return sendError("Konten materi tidak tersedia untuk dijawab.", 400);
    }

    // OPTIMASI TOKEN STRATEGIS:
    // Membersihkan teks dari karakter yang tidak perlu dan membatasi jumlah token input.
    const cleanContent = moduleContent
      .replace(/[\r\n]+/g, ' ') // Ganti newline dengan spasi
      .replace(/\s\s+/g, ' ')   // Hapus spasi ganda
      .trim();

    // Gunakan 8000 karakter (~2000 token) sebagai window konteks yang sangat aman & hemat.
    const contextWindow = cleanContent.length > 8000
      ? cleanContent.substring(0, 8000)
      : cleanContent;

    // Pemilihan Model: Menggunakan Llama 3.3 70B sebagai standar akurasi tinggi dari list user.
    const model = model_preference || "llama-3.3-70b-versatile";

    const systemPrompt = `Anda adalah Spesialis Edukasi BintangAi.
Tugas: Menjawab pertanyaan siswa secara PROFESIONAL, AKURAT, dan RINGKAS berdasarkan materi di bawah ini.

MATERI: "${moduleTitle}"
KONTEKS TEKS:
"""
${contextWindow}
"""

ATURAN KERJA:
1. AKURASI: Jawaban harus 100% berdasarkan KONTEKS TEKS. Jangan memberikan informasi tambahan dari luar teks.
2. GAYA BAHASA: Gunakan Bahasa Indonesia yang sangat profesional, edukatif, dan sopan. Sesuaikan dengan level ${grade_level || 'Pendidikan Dasar/Menengah'}.
3. HEMAT TOKEN: Berikan jawaban yang to-the-point namun tetap komprehensif. Jangan bertele-tele.
4. JIKA TIDAK ADA: Jika jawaban tidak ditemukan dalam teks, balas dengan: "Mohon maaf, materi '${moduleTitle}' tidak mencantumkan informasi terkait hal tersebut. Silakan hubungi pengajar Anda atau tanyakan bagian lain dari modul ini."
5. FORMAT WAJIB: Balas HANYA dengan format JSON berikut:

{
  "reply": "Isi jawaban Anda...",
  "status": "found" | "not_found",
  "token_saving_mode": true
}`;

    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ], {
      model: model,
      temperature: 0.1, // Rendah untuk konsistensi dan akurasi
      maxTokens: 600    // Cukup untuk jawaban edukatif yang padat
    });

    let finalData;
    try {
      // Parsing JSON dengan proteksi terhadap format markdown
      const text = aiResponse.content.trim().replace(/^```json/, "").replace(/```$/, "").trim();
      finalData = JSON.parse(text);
    } catch {
      // Fallback jika AI gagal format JSON
      finalData = {
        reply: aiResponse.content,
        status: "found",
        token_saving_mode: true
      };
    }

    return sendResponse({
      success: true,
      answer: finalData.reply,
      found: finalData.status === "found",
      module: moduleTitle
    });

  } catch (error: any) {
    console.error("Materi AI Internal Error:", error);
    return sendError("Layanan sedang sibuk, mohon coba beberapa saat lagi.", 500);
  }
});
