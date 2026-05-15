import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAdminClient } from "../_shared/clients/supabase.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { class_code, subject } = await req.json();
    if (!class_code) return sendError("Class code is required", 400);

    const supabase = getAdminClient();

    // 1. Ambil weak_topics agregat kelas
    const { data: students, error: studentError } = await supabase
      .from('profiles')
      .select('weak_topics')
      .eq('class_code', class_code)
      .eq('role', 'siswa');

    if (studentError) throw studentError;

    const topicCounts: Record<string, number> = {};
    students?.forEach(s => {
      s.weak_topics?.forEach((t: string) => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    });

    const topWeaknesses = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const contextTopics = topWeaknesses.length > 0 ? topWeaknesses.join(", ") : "materi umum SD";

    // 2. AI Prompt
    const systemPrompt = "Kamu adalah asisten pengajar SD. Tugasmu membuat soal pilihan ganda yang sesuai dengan topik kesulitan siswa. Berikan output dalam format JSON murni.";

    const userPrompt = `Buatkan 5 soal pilihan ganda untuk anak SD kelas 4-6 tentang: ${contextTopics}.
    Mata pelajaran: ${subject || 'Matematika'}.

    Format harus JSON valid dengan struktur:
    {
      "questions": [
        {
          "text": "Pertanyaan...",
          "type": "pilihan_ganda",
          "points": 20,
          "options": [
            {"text": "Opsi A", "isCorrect": false},
            {"text": "Opsi B", "isCorrect": true},
            {"text": "Opsi C", "isCorrect": false},
            {"text": "Opsi D", "isCorrect": false}
          ]
        }
      ]
    }`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], {
      model: "llama-3.1-8b-instant",
      temperature: 0.6
    });

    const result = JSON.parse(aiResult.content);

    return sendResponse(result);

  } catch (error: any) {
    console.error("Generate-Questions Error:", error);
    return sendError(error.message);
  }
});
