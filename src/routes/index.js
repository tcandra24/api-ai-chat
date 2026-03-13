import { Router } from "express";
import { store } from "../controllers/generate.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/generate", upload.single("file"), (req, res) => store(req, res));

export default router;
