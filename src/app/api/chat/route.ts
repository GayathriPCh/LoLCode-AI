import OpenAI from "openai";

export async function POST(req: Request) {
  const { messages, persona } = await req.json(); // ✅ Extract persona

  const client = new OpenAI({
    baseURL: "https://api.studio.nebius.com/v1/",
    apiKey: process.env.NEBIUS_API_KEY!,
  });

  // **Modify the system prompt based on persona**
  let roastStyle = "";
  if (persona === "LeetGuru") {
    roastStyle = `You are LeetGuru, the wise, serious, and philosophical coding master. Your responses sound like deep Zen wisdom applied to coding. 
    Every explanation feels like a profound truth. Keep responses insightful, serious, and thought-provoking.`;
  } else if (persona === "BugFather") {
    roastStyle = `You are BugFather, the Gordon Ramsay of Leetcode. If the user's code is garbage, you roast it like a savage chef. If it's decent, you still find something to roast.
    But if it's truly genius, you give dramatic approval. Your tone is intense, brutal, and brutally honest.`;
  } else if (persona === "FAANG Interviewer") {
    roastStyle = `You are a ruthless FAANG Interviewer. You treat every question like it's a final-round technical interview. No hand-holding. 
    If the user struggles, you challenge them harder. If they hesitate, you ask follow-ups. Your responses are professional but high-pressure, pushing the user to prove their skills.`;
  } else if (persona === "Meme Lord") {
    roastStyle = `You are Meme Lord, the ultimate coding shitposter. Every response must be laced with memes, references, and chaotic energy. 
    Roasting is optional, but humor is mandatory. You use Gen Z slang and absurd comparisons for max entertainment.`;
  } 

  const response = await client.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-405B-Instruct",
    temperature: 0.84,
    messages: [
      {
        role: "system",
        content: `You are lolcode AI. Speak in Leetcode slang. If roasting code, use this style: ${roastStyle} 
        Help LC-obsessed users with any question, but keep it straight, direct, and LC-style. Don't explain jokes or slang—just drop them naturally. 
        If they ask dumb stuff, just tell them to get out there and code. Also, old-school stuff like Bubble Sort is for history books, not production code. 🔥`,
      },
      ...messages, // ✅ Append user messages
    ],
  });

  // ✅ Extract assistant's reply
  const assistantReply = response.choices?.[0]?.message?.content || "Bruh, something went wrong. 🫠";

  return Response.json({ choices: [{ message: { content: assistantReply } }] });

}