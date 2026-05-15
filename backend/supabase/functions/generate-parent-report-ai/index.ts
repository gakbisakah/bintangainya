import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAdminClient } from "../_shared/clients/supabase.ts";
import { callAI } from "../_shared/services/ai.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { student_id } = await req.json();
    if (!student_id) return sendError("Student ID is required", 400);

    const supabase = getAdminClient();

    // 1. Ambil data siswa
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('full_name, weak_topics, xp, class_level')
      .eq('id', student_id)
      .single();

    if (studentError || !student) throw new Error("Siswa tidak ditemukan");

    // 2. Ambil skor tugas terbaru
    const { data: submissions } = await supabase
      .from('submissions')
      .select('total_score, assignments(title)')
      .eq('student_id', student_id)
      .order('submitted_at', { ascending: false })
      .limit(5);

    const scoresText = submissions?.map((s: any) => `- ${s.assignments?.title}: ${s.total_score}`).join("\n") || "Belum ada tugas.";
    const topicsText = student.weak_topics?.length > 0 ? student.weak_topics.join(", ") : "Tidak ada topik spesifik.";

    // 3. Panggil AI Service
    const systemPrompt = "Kamu adalah Kak BintangAi, asisten pelaporan pendidikan. Tugasmu membuat laporan yang ramah dan mudah dimengerti orang tua dalam Bahasa Indonesia.";

    const userPrompt = `Buatkan laporan mingguan untuk orang tua tentang progres belajar anak bernama ${student.full_name}.
    Data:
    - Kelas: ${student.class_level}
    - Total XP: ${student.xp}
    - Topik yang perlu ditingkatkan: ${topicsText}
    - Skor 5 tugas terakhir:
    ${scoresText}

    Jelaskan apa yang sudah baik dan apa yang perlu perhatian khusus di rumah. Maksimal 150 kata.`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], {
      model: "llama-3.1-8b-instant",
      temperature: 0.7
    });

    return sendResponse({
      success: true,
      report: aiResult.content
    });

  } catch (error: any) {
    console.error("Generate-Parent-Report-AI Error:", error);
    return sendError(error.message);
  }
});
