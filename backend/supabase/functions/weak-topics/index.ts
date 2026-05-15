import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAdminClient } from "../_shared/clients/supabase.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { student_id, action, question, answer, topics } = await req.json();
    const adminSupabase = getAdminClient();

    if (action === "detect") {
      const systemPrompt = "Kamu adalah asisten analisis pendidikan. Tugasmu mendeteksi 1 topik utama (max 2 kata) dari teks soal dan jawaban berikut. Balas HANYA dengan nama topiknya saja tanpa penjelasan apa pun. Contoh: 'Pecahan', 'Tata Surya', 'Fotosintesis'.";

      const aiResult = await callAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Soal: ${question}\nJawaban Siswa: ${answer}` }
      ], { model: "llama-3.1-8b-instant", temperature: 0.1 });

      const detectedTopic = aiResult.content?.trim() || "Materi Umum";
      return sendResponse({ topics: [detectedTopic] });
    }

    if (action === "add") {
      if (!student_id || !topics) return sendError("student_id and topics required", 400);

      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('weak_topics')
        .eq('id', student_id)
        .single();

      const existingTopics = profile?.weak_topics || [];
      const updatedTopics = Array.from(new Set([...existingTopics, ...topics])).slice(-10);

      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({ weak_topics: updatedTopics })
        .eq('id', student_id);

      if (updateError) throw updateError;

      return sendResponse({ success: true, topics: updatedTopics });
    }

    return sendError("Invalid action", 400);
  } catch (error: any) {
    console.error("Weak-Topics Error:", error);
    return sendResponse({ success: false, error: error.message }, 200);
  }
});
