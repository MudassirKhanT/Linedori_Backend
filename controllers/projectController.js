import Project from "../models/Project.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const createProject = async (req, res) => {
  try {
    const { title, category, subCategory, description, contactDescription, isPrior, toHomePage, homePageOrder } = req.body;

    const cleanedSubCategory = subCategory && subCategory.trim() !== "" ? subCategory : undefined;

    const processedImages = [];

    if (req.files?.images) {
      for (const file of req.files.images) {
        const inputPath = file.path;

        const buffer = await fs.promises.readFile(inputPath);

        const metadata = await sharp(buffer).metadata();
        const ratio = (metadata.width / metadata.height).toFixed(3);

        const ext = path.extname(inputPath);
        const folder = path.dirname(inputPath);
        const newPath = path.join(folder, `${Date.now()}.${ratio}${ext}`);

        await fs.promises.rename(inputPath, newPath);

        processedImages.push(newPath);
      }
    }

    const pdfFile = req.files?.pdfFile ? req.files.pdfFile[0].path : null;

    const videoFile = req.files?.videoFile ? req.files.videoFile[0].path : null;

    if (toHomePage === "true" && homePageOrder) {
      await Project.updateMany({ toHomePage: true, homePageOrder: { $gte: Number(homePageOrder) } }, { $inc: { homePageOrder: 1 } });
    }

    const newProject = new Project({
      title,
      category,
      subCategory: cleanedSubCategory,
      description,
      contactDescription,
      images: processedImages,
      pdfFile,
      videoFile,
      isPrior: isPrior === "true" || isPrior === true,
      toHomePage: toHomePage === "true" || toHomePage === true,
      homePageOrder: homePageOrder ? Number(homePageOrder) : null,
    });

    const savedProject = await newProject.save();

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: savedProject,
    });
  } catch (err) {
    console.error("❌ Error creating project:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating project",
      error: err.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, subCategory, description, isPrior, toHomePage, homePageOrder, contactDescription } = req.body;

    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (title) existingProject.title = title;
    if (category) existingProject.category = category;

    if (subCategory !== undefined) {
      existingProject.subCategory = subCategory.trim() === "" ? undefined : subCategory;
    }

    if (description) existingProject.description = description;
    if (contactDescription) existingProject.contactDescription = contactDescription;

    if (isPrior !== undefined) existingProject.isPrior = isPrior === "true" || isPrior === true;

    if (toHomePage !== undefined) existingProject.toHomePage = toHomePage === "true" || toHomePage === true;

    if (homePageOrder !== undefined) existingProject.homePageOrder = Number(homePageOrder);

    let finalImages = [];

    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];

      finalImages.push(...existingImages);
    }

    if (req.files?.images) {
      for (const file of req.files.images) {
        const inputPath = file.path;

        const buffer = await fs.promises.readFile(inputPath);
        const metadata = await sharp(buffer).metadata();

        const ratio = (metadata.width / metadata.height).toFixed(3);
        const ext = path.extname(inputPath);
        const folder = path.dirname(inputPath);
        const newPath = path.join(folder, `${Date.now()}.${ratio}${ext}`);

        await fs.promises.rename(inputPath, newPath);

        finalImages.push(newPath);
      }
    }

    existingProject.images = finalImages;

    if (req.files?.pdfFile) {
      existingProject.pdfFile = req.files.pdfFile[0].path;
    }

    if (req.files?.videoFile) {
      existingProject.videoFile = req.files.videoFile[0].path;
    }

    await existingProject.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: existingProject,
    });
  } catch (error) {
    console.error("❌ Error updating project:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHomePageProjects = async (req, res) => {
  try {
    const projects = await Project.find({ toHomePage: true }).sort({ homePageOrder: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    const query = {};
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    const projects = await Project.find(query).sort({ isPrior: -1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
