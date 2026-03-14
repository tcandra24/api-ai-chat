import { generateContent } from "../services/gemini.js";

export const store = async (req, res) => {
  try {
    const { prompt } = req.body;

    const contents = [
      {
        type: "text",
        text: prompt,
      },
    ];

    if (req.file) {
      const base64File = req.file.buffer.toString("base64");
      contents.push({
        inlineData: {
          data: base64File,
          mimeType: req.file.mimetype,
        },
      });
    }

    const response = await generateContent(contents);

    res.status(200).json({
      result: response.text,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
