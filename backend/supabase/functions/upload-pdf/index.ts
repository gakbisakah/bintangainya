import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAdminClient } from "../_shared/clients/supabase.ts";
import { sendResponse, sendError, corsHeaders } from "../_shared/utils/response.ts";
import pdfParse from "https://esm.sh/pdf-parse@1.1.1";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return sendError("No file uploaded", 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // PDF Parsing
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // Supabase Admin Client
    const supabase = getAdminClient();

    // Simpan file ke Supabase Storage
    const fileName = `${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(fileName, buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    return sendResponse({
      success: true,
      text,
      filePath: fileName
    });

  } catch (error: any) {
    console.error("Upload-PDF Error:", error);
    return sendError(error.message);
  }
});
