import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAdminClient } from "../_shared/clients/supabase.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";

function normalizeTopic(topic: string) {
  return topic.toLowerCase().trim().replace(/[\[\]]/g, '');
}

function extractTopics(text: string) {
  const topics = new Set<string>();
  const textLower = text.toLowerCase();

  // 1. Deteksi Tag AI (Format: <!--TOPICS:pecahan,penjumlahan-->)
  const aiTagMatch = text.match(/<!--TOPICS:([\s\S]*?)-->/i);
  if (aiTagMatch && aiTagMatch[1]) {
    const cleaned = aiTagMatch[1].replace(/[\[\]]/g, '');
    cleaned.split(',').forEach(t => {
      const norm = normalizeTopic(t);
      if (norm) topics.add(norm);
    });
  }

  // 2. Deteksi Simbol & Kata Kunci (Fallback Agresif)
  const keywords: Record<string, string[]> = {
    "penjumlahan": ["tambah", "jumlah", "+", "tambahkan"],
    "pengurangan": ["kurang", "-", "sisa", "dikurangi"],
    "perkalian": ["kali", "x", "*", "dikali"],
    "pembagian": ["bagi", "/", ":", "dibagi"],
    "pecahan": ["pecahan", "per", "/", "setengah", "seper"],
    "matematika": ["hitung", "berapa", "hasilnya"]
  };

  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(w => textLower.includes(w))) {
      topics.add(topic);
    }
  }

  return Array.from(topics).slice(0, 5);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const { student_id, action, topics, question, answer } = body;
    const adminSupabase = getAdminClient();

    // ACTION: DETECT
    if (action === "detect") {
      const detected = extractTopics(`${question} ${answer}`);
      return sendResponse({ topics: detected });
    }

    // ACTION: ADD
    if (action === "add") {
      if (!student_id) return sendError("ID Siswa tidak ditemukan!", 400);
      if (!topics || topics.length === 0) return sendResponse({ success: true, message: "Tidak ada topik untuk ditambah" });

      const { data: profile, error: fetchError } = await adminSupabase
        .from('profiles')
        .select('weak_topics')
        .eq('id', student_id)
        .single();

      if (fetchError) throw fetchError;

      const existingTopics = profile?.weak_topics || [];
      const updatedTopics = Array.from(new Set([...existingTopics, ...topics]));

      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({ weak_topics: updatedTopics })
        .eq('id', student_id);

      if (updateError) throw updateError;

      return sendResponse({ success: true, topics: updatedTopics });
    }

    return sendError("Action tidak valid", 400);
  } catch (error: any) {
    console.error("Weak-Topic Error:", error);
    return sendResponse({ success: false, error: error.message }, 200);
  }
});
