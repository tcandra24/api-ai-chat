import { Router } from "express";
import multer from "multer";

import { store as storeChatStream } from "../controllers/chat-stream.js";
import { store as storeGenerate } from "../controllers/generate.js";
import { store as storeChat } from "../controllers/chat.js";

const router = Router();
const upload = multer();

router.post("/generate", upload.single("file"), (req, res) => storeGenerate(req, res));
router.post("/chat-stream", (req, res) => storeChatStream(req, res));
router.post("/chat", (req, res) => storeChat(req, res));

export default router;
