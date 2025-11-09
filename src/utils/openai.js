import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": window.location.origin,
    "X-Title": "AI Chat Bot",
  },
  dangerouslyAllowBrowser: true,
});

export async function createCompletion(
  prompt,
  model = "openai/gpt-oss-20b:free"
) {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });

  const { content } = completion.choices[0].message;
  return content.trim();
}

export async function* chatStream(prompt, model = "openai/gpt-oss-20b:free") {
  const stream = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
}
