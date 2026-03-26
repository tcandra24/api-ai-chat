import { generateContent } from "../services/gemini.js";
import { instruction } from "../config/index.js";

export const store = async (req, res) => {
  try {
    const { conversation } = req.body;

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await generateContent(contents, {
      temperature: 1.3,
      systemInstruction: instruction,
    });

    res.status(200).json({
      result: response.text,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
