import { generateContent } from "../services/gemini.js";
import { readFileSync } from "fs";

const instructionMarkDown = readFileSync("./server/instruction.md", "utf-8");

export const store = async (req, res) => {
  try {
    const { conversation } = req.body;

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await generateContent(contents, {
      temperature: 1.3,
      systemInstruction: instructionMarkDown,
    });

    res.status(200).json({
      result: response.text,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
