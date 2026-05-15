import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const clientApiKey = req.headers.get("x-api-key");
    const serverApiKey = Deno.env.get("CUSTOM_AI_TUTOR_KEY") || "christian";

    if (!clientApiKey || clientApiKey !== serverApiKey) {
      return sendError("Akses ditolak.", 401);
    }

    const body = await req.json();
    const question = body.question || body.query || body.message;
    const { context, user_profile } = body;

    if (!question) return sendError("Pertanyaan kosong.", 400);

    const safeContext = context ? (context.length > 8000 ? context.substring(0, 8000) : context) : "Umum";

    const systemPrompt = `Kamu adalah Kak BintangAi, asisten pintar untuk siswa SD.
Tugasmu adalah menjawab pertanyaan siswa HANYA berdasarkan materi buku yang diberikan.

KONTEKS MATERI BUKU:
"""
${safeContext}
"""

ATURAN OUTPUT (WAJIB FORMAT JSON):
Kamu harus menjawab dalam format JSON dengan struktur:
{
  "answer": "Jawaban ceria dengan bahasa anak SD dan banyak emoji",
  "source_quote": "Kutipan kalimat atau paragraf asli dari teks di atas yang menjadi sumber jawaban (tulis persis sama agar bisa ditemukan)"
}

ATURAN JAWABAN:
1. Jika jawaban ada di teks, tulis di "answer" dan berikan kutipan aslinya di "source_quote".
2. Jika jawaban TIDAK ADA, "answer" berisi penolakan sopan, dan "source_quote" berisi null.
3. Jangan pernah memberikan informasi di luar konteks materi.`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Pertanyaan: ${question}` }
    ], {
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      maxTokens: 1000
    });

    // Parsing JSON response
    try {
      const parsed = JSON.parse(aiResult.content);
      return sendResponse({
        success: true,
        answer: parsed.answer,
        source_quote: parsed.source_quote
      });
    } catch {
      // Fallback if AI didn't return valid JSON
      return sendResponse({
        success: true,
        answer: aiResult.content,
        source_quote: null
      });
    }

  } catch (error: any) {
    console.error("Ask-Tutor Error:", error);
    return sendResponse({
      success: false,
      answer: "Aduh, Kak Bintang lagi kebingungan. Coba tanya sekali lagi ya! 😊"
    }, 200);
  }
});
