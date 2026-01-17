import express from "express";
import { getStudios, getStudioById, createStudio, updateStudio, deleteStudio } from "../controllers/studioController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getStudios);
router.get("/:id", getStudioById);
router.post("/", upload.single("image"), createStudio);
router.put("/:id", upload.single("image"), updateStudio);
router.delete("/:id", deleteStudio);

export default router;
