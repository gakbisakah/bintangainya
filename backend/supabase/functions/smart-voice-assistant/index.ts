import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, sendResponse, sendError } from "../_shared/utils/response.ts";
import { callAI } from "../_shared/services/ai.ts";

/**
 * NAY SMART VOICE AGENT v2 - Anti-Loop & High Accuracy
 * Models: Whisper Large V3 (Hearing) & Llama 3.3 70B (Reasoning)
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

    const formData = await req.formData();
    const audioFile = formData.get("file") as File;
    const context = formData.get("context") as string || "Beranda";
    const studentName = formData.get("studentName") as string || "Teman";

    if (!audioFile) return sendError("Suara tidak tertangkap.", 400);

    // 1. TRANSCRIPTION (Whisper Large V3)
    const groqFormData = new FormData();
    groqFormData.append("file", audioFile);
    groqFormData.append("model", "whisper-large-v3");
    groqFormData.append("response_format", "json");
    groqFormData.append("language", "id");

    const transcribeResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: groqFormData,
    });

    const transcriptionData = await transcribeResponse.json();
    const transcript = transcriptionData.text;

    // CRITICAL FIX: Ignore background noise that sounds like "Terima kasih" or short loops
    if (!transcript || transcript.trim().length < 3 || transcript.toLowerCase().includes("terima kasih") && transcript.length < 15) {
      return sendResponse({
        success: true,
        transcript: "",
        reply: "Nay siap mendengarkan. Ada yang bisa dibantu?",
        isNoise: true
      });
    }

    // 2. INTELLIGENT AGENTIC ROUTING (Llama 3.3 70B)
    const systemPrompt = `Kamu adalah NAY, Agen Suara Pintar AI yang sangat cerdas, cepat, dan empatik untuk siswa tunanetra.
MISI: Menjadi asisten "Live Agent" yang membantu belajar dan navigasi secara instan.

KEPRIBADIAN: Ceria, sangat proaktif, dan cerdas. Kamu bisa mengendalikan website untuk membantu siswa.

SISWA: ${studentName}.
HALAMAN SAAT INI: ${context}.

LOGIKA AGENTIK (Pilih salah satu format respon):
1. Navigasi Fitur Utama:
   - "materi/pelajaran" -> [NAVIGATE:modules]
   - "kuis/tugas" -> [NAVIGATE:tasks]
   - "grup belajar/komunitas/diskusi" -> [NAVIGATE:community]
   - "profil/akun" -> [NAVIGATE:profile]
   - "tanya ai/playground" -> [NAVIGATE:playground]
   - "beranda/dashboard" -> [NAVIGATE:dashboard]

2. Membuka Item Spesifik (Materi/Kuis tertentu):
   Jika siswa menyebutkan nama materi atau kuis (misal: "Buka materi sistem tata surya"), gunakan:
   [ACTION:OPEN_ITEM|Nama Item]
   Contoh: "Baik, Kak Bintang buka materi Tata Surya ya. [ACTION:OPEN_ITEM|Tata Surya]"

ATURAN:
- Jika siswa ingin pindah fitur utama, gunakan [NAVIGATE:target].
- Jika siswa ingin membuka konten spesifik di dalam halaman, gunakan [ACTION:OPEN_ITEM|Target].
- Jawab dengan ceria dan singkat (max 20 kata).
- Kamu harus cerdas membedakan antara pindah fitur dan membuka materi.
- Selalu konfirmasi apa yang kamu lakukan.`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript }
    ], {
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      maxTokens: 300
    });

    const reply = aiResult.content;
    const navMatch = reply.match(/\[NAVIGATE:(.*?)\]/);
    const actionMatch = reply.match(/\[ACTION:(.*?)\|(.*?)\]/);

    const cleanReply = reply.replace(/\[NAVIGATE:.*?\]/g, "").replace(/\[ACTION:.*?\]/g, "").trim();

    return sendResponse({
      success: true,
      transcript,
      reply: cleanReply,
      navigateTo: navMatch ? navMatch[1] : null,
      action: actionMatch ? actionMatch[1] : null,
      actionData: actionMatch ? actionMatch[2] : null,
      model_analyze: "llama-3.3-70b-versatile"
    });

  } catch (error: any) {
    return sendError("Nay sedang gangguan koneksi.", 500);
  }
});
