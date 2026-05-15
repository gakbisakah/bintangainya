/**
 * Unified AI Service for BintangAi
 * Supports Groq with Llama models
 */

export interface AIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const callAI = async (
  messages: { role: string; content: string }[],
  config: AIConfig = {}
) => {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

  if (!GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY in environment");
  }

  const model = config.model || "llama-3.3-70b-versatile";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 1024,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("AI Service Error:", result);
      throw new Error(result.error?.message || "Failed to get AI response");
    }

    return {
      content: result.choices?.[0]?.message?.content || "",
      raw: result
    };
  } catch (error) {
    console.error("AI Service Exception:", error);
    throw error;
  }
};
