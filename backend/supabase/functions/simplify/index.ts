import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text) return sendError("Missing text", 400);

    // Prompt sederhana untuk Simplify
    const systemPrompt = `Kamu adalah Kak BintangAi.
    Tugasmu adalah menjelaskan konsep sulit menjadi sangat sederhana agar anak SD paham.
    Gunakan analogi dunia nyata dan bahasa yang ceria.`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Jelaskan materi ini dengan bahasa anak SD: ${text}` }
    ], {
      model: "llama-3.1-8b-instant",
      temperature: 0.5
    });

    return sendResponse({
      success: true,
      simplified: aiResult.content
    });

  } catch (error: any) {
    console.error("Simplify Error:", error);
    return sendError(error.message);
  }
});
