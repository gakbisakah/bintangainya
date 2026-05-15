import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { studentData } = await req.json();
    if (!studentData) return sendError("Student data is required", 400);

    const systemPrompt = `Kamu adalah Kak BintangAi, konsultan pendidikan ramah.
    Tugasmu adalah membuat insight untuk orang tua tentang perkembangan belajar anak berdasarkan data yang diberikan.
    Gunakan bahasa yang hangat, suportif, dan mudah dimengerti dalam Bahasa Indonesia.`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Berikut adalah data belajar anak: ${JSON.stringify(studentData)}` }
    ], {
      model: "llama-3.3-70b-versatile",
      temperature: 0.7
    });

    return sendResponse({
      success: true,
      insight: aiResult.content
    });

  } catch (error: any) {
    console.error("Get-Insight Error:", error);
    return sendError(error.message);
  }
});
