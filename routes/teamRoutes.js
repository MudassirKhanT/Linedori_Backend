import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { createTeamMember, getTeamMembers, updateTeamMember, deleteTeamMember } from "../controllers/teamController.js";

const router = express.Router();

router.post("/", upload.single("image"), createTeamMember);
router.get("/", getTeamMembers);
router.put("/:id", upload.single("image"), updateTeamMember);
router.delete("/:id", deleteTeamMember);

export default router;
