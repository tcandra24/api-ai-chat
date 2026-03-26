import { generateContentStream } from "../services/gemini.js";
import { instruction } from "../config/index.js";

export const store = async (req, res) => {
  try {
    const { conversation } = req.body;

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const stream = await generateContentStream(contents, {
      temperature: 1.3,
      systemInstruction: instruction,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";

      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(
      `data: ${JSON.stringify({
        error: true,
        message: "AI service error",
      })}\n\n`,
    );
    res.end();
  }
};
