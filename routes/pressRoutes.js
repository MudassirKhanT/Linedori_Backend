import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { createPress, getPress, updatePress, deletePress } from "../controllers/pressController.js";

const router = express.Router();

router.post("/", upload.single("image"), createPress);
router.get("/", getPress);
router.put("/:id", upload.single("image"), updatePress);
router.delete("/:id", deletePress);

export default router;
