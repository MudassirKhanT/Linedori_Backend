import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getHomePageProjects } from "../controllers/projectController.js";

const router = express.Router();

router.get("/homepage/list", getHomePageProjects);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post(
  "/",
  protect,
  upload.fields([
    { name: "images", maxCount: 15 },
    { name: "pdfFile", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
  ]),
  createProject
);

router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "images", maxCount: 15 },
    { name: "pdfFile", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
  ]),
  updateProject
);

router.delete("/:id", protect, deleteProject);

export default router;
