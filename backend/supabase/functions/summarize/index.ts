import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const clientApiKey = req.headers.get("x-api-key");
    const serverApiKey = Deno.env.get("CUSTOM_AI_TUTOR_KEY") || "christian";

    if (!clientApiKey || clientApiKey !== serverApiKey) {
      return sendError("Unauthorized", 401);
    }

    const { content, grade_level } = await req.json();
    if (!content) return sendError("Content required", 400);

    // OPTIMASI TOKEN: Potong teks jika terlalu panjang
    const safeContent = content.length > 7000 ? content.substring(0, 7000) + "..." : content;

    const systemPrompt = `Kamu adalah BintangAi, asisten perangkum materi SD.
Tugasmu adalah membuat ringkasan materi yang sangat mudah diingat untuk anak kelas ${grade_level || 'SD'}.

Aturan Ringkasan:
1. Singkat, padat, dan jelas (Gunakan poin-poin).
2. Gunakan bahasa yang ceria dan santun.
3. Fokus pada konsep kunci yang perlu dihafal/dipahami anak SD.
4. Gunakan banyak emoji yang relevan.

Format:
📖 **CERITA SINGKAT**
[1 paragraf ringkasan isi buku]

💡 **POIN PENTING**
- [Poin 1]
- [Poin 2]
...

🚀 **TIPS BELAJAR**
[1 tips seru]`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Materi:\n${safeContent}` }
    ], {
      model: "llama-3.3-70b-versatile", // Model 70B untuk pemahaman mendalam
      temperature: 0.5,
      maxTokens: 1024
    });

    return sendResponse({
      success: true,
      summary: aiResult.content || "Gagal membuat ringkasan."
    });

  } catch (error: any) {
    console.error("Summarize Error:", error);
    return sendResponse({
      success: false,
      summary: "Waduh, Kak Bintang gagal meringkas buku ini. Coba tanya langsung saja di chat ya! 😊"
    }, 200);
  }
});
