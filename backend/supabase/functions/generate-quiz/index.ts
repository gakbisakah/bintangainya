import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

/**
 * AI QUIZ GENERATOR V2.1 - ROBUST VERSION
 * Primary Model: llama-3.3-70b-versatile (Highly Stable on Groq)
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const clientApiKey = req.headers.get("x-api-key");
    const serverApiKey = Deno.env.get("CUSTOM_AI_TUTOR_KEY") || "christian";

    if (!clientApiKey || clientApiKey !== serverApiKey) {
      return sendError("Unauthorized", 401);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return sendError("Invalid JSON body", 400);
    }

    if (body.ping) return sendResponse({ success: true, message: "pong" });

    const {
      subject,
      topic,
      grade_level = 4,
      question_types = ["multiple_choice"],
      total_questions = 5,
      difficulty = "medium",
      title,
      instructions,
      duration_minutes = 30
    } = body;

    // Safety limit: 100 is too much for a single prompt (token limit). Recommended max: 15-20.
    // However, we will try to satisfy the user request but cap it at 40 for stability.
    const numQuestions = Math.min(Math.max(parseInt(total_questions.toString()) || 5, 1), 40);
    const isEnglish = subject?.toLowerCase() === 'english' || topic?.toLowerCase().includes('english');

    let difficultyText = "Sedang";
    let difficultyInstruction = "Buat soal dengan tingkat kesulitan standar untuk anak SD.";

    if (difficulty === 'hard') {
      difficultyText = "Sangat Sulit (Tantangan)";
      difficultyInstruction = "Buat soal yang membutuhkan analisa mendalam, pemecahan masalah (HOTS), dan logika kritis.";
    }

    const systemPrompt = `You are "Kak Bintang", a professional AI Teacher.
    TASK: Generate a high-quality quiz for grade ${grade_level} students.
    LANGUAGE: ${isEnglish ? 'STRICTLY FULL ENGLISH' : 'STRICTLY FULL INDONESIAN (Bahasa ramah anak SD)'}.

    STRICT JSON SCHEMA (OUTPUT ONLY THIS):
    {
      "quiz_title": "string",
      "instructions": "string",
      "questions": [
        {
          "type": "multiple_choice",
          "question": "string",
          "options": ["A", "B", "C", "D"],
          "correct_answer_index": 0,
          "feedback_correct": "string",
          "feedback_wrong": "string",
          "points": 10
        }
      ]
    }

    STRICT RULES:
    1. Respond ONLY with the JSON object. No conversational filler.
    2. For "multiple_choice", provide exactly 4 options.
    3. For "essay", set "type" to "essay" and leave "options" and "correct_answer_index" empty or null.
    4. "feedback_correct" is a praise, "feedback_wrong" is a hint.
    5. Subject: ${subject}, Topic: ${topic}.`;

    const userPrompt = `Buatkan ${numQuestions} soal kuis (Tipe: ${question_types.join(", ")}) dengan tingkat kesulitan ${difficultyText}. ${difficultyInstruction}`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], {
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Minimal temperature for stability
      maxTokens: 4000
    });

    let content = aiResult.content.trim();

    // Enhanced JSON Extraction: Find the first '{' and last '}'
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }

    try {
      const quizResult = JSON.parse(content);

      // Basic validation
      if (!quizResult.questions || !Array.isArray(quizResult.questions)) {
        throw new Error("Missing questions array");
      }

      return sendResponse({ success: true, quiz: quizResult });
    } catch (parseError) {
      console.error("Failed to parse AI JSON. Content preview:", content.substring(0, 500));
      return sendError("⚠️ AI gagal menyusun format kuis yang tepat. Hal ini biasanya terjadi karena permintaan terlalu kompleks atau jumlah soal terlalu banyak. Silakan coba lagi dengan jumlah soal yang lebih sedikit (5-10 soal).", 500);
    }

  } catch (error: any) {
    console.error("Fatal Generate-Quiz Error:", error);
    return sendError(`⚠️ Terjadi kesalahan sistem: ${error.message}. Silakan coba beberapa saat lagi.`, 500);
  }
});
