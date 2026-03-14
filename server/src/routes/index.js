import { Router } from "express";
import { store as storeGenerate } from "../controllers/generate.js";
import { store as storeChat } from "../controllers/chat.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/generate", upload.single("file"), (req, res) => storeGenerate(req, res));
router.post("/chat", (req, res) => storeChat(req, res));

export default router;
