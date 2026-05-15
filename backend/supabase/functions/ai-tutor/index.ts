import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAdminClient } from "../_shared/clients/supabase.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

/**
 * AI TUTOR AGENT - BintangAi Ultra-Responsive Assistant
 * Models: llama-3.3-70b-versatile (Reasoning), Whisper Large v3 (Hearing)
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const clientApiKey = req.headers.get("x-api-key");
    const serverApiKey = Deno.env.get("CUSTOM_AI_TUTOR_KEY") || "christian";

    if (!clientApiKey || clientApiKey !== serverApiKey) {
      return sendError("Akses ditolak. 🔒", 401);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (body.ping === true) return sendResponse({ success: true, message: "pong" });

    const {
      message,
      student_id,
      nama = "Teman",
      kelas = 4,
      history = [],
      disability_type = "umum"
    } = body;

    if (!message) return sendError("Pesan kosong. 😊", 400);

    const isBlind = disability_type === "tunanetra" || disability_type === "blind";

    const systemPrompt = `Kamu adalah Kak Bintang, Sahabat Belajar & Agen Pintar siswa SD.
NAMA SISWA: ${nama}, KELAS: ${kelas}. KONTEKS: ${disability_type}.

MISI KHUSUS TUNANETRA:
- Jawab dengan suara yang sangat jelas, ramah, dan artikulasi mudah dipahami.
- Gunakan bahasa yang deskriptif namun singkat (Maks 35 kata).
- Jangan gunakan format teks rumit (seperti tabel/markdown berat) karena akan dibaca oleh Text-to-Speech.
- Jika siswa ingin membuka fitur (Materi, Tugas, Profil), gunakan format: [NAVIGATE:target].

LOGIKA NAVIGASI AGENT:
- "buka materi", "pelajaran" -> [NAVIGATE:modules]
- "lihat tugas", "kuis" -> [NAVIGATE:tasks]
- "ke profil", "nilaiku" -> [NAVIGATE:profile]
- "halaman utama", "beranda" -> [NAVIGATE:dashboard]

Gunakan banyak emoji yang ceria dalam teks, namun prioritaskan kejelasan suara.`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      ...history.slice(-6),
      { role: "user", content: message }
    ], {
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      maxTokens: 400
    });

    let aiReply = aiResult.content || "Wah, aku butuh waktu sebentar nih. Yuk lanjut ngobrol! 😊";

    // Extract Navigation if any
    const navMatch = aiReply.match(/\[NAVIGATE:(.*?)\]/);
    const navigateTo = navMatch ? navMatch[1] : null;
    aiReply = aiReply.replace(/\[NAVIGATE:.*?\]/g, "").trim();

    // Log Interaction
    const adminSupabase = getAdminClient();
    if (student_id) {
      try {
        await adminSupabase.from('ai_interactions').insert({
          student_id,
          question: message,
          answer: aiReply,
          topic: "Umum",
          grade_context: kelas.toString(),
          disability_context: disability_type
        });
      } catch (logError) {
        console.error("Logging Error:", logError);
      }
    }

    return sendResponse({
      success: true,
      reply: aiReply,
      navigateTo: navigateTo,
      model_used: "llama-3.3-70b-versatile"
    });

  } catch (error: any) {
    console.error("Agent Fatal Error:", error);
    return sendError("Waduh, otak belajarku lagi istirahat. Coba lagi ya? 😊", 500);
  }
});
