import Project from "../models/Project.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// export const createProject = async (req, res) => {
//   try {
//     const { title, category, subCategory, description, contactDescription, isPrior, toHomePage, homePageOrder } = req.body;

//     const cleanedSubCategory = subCategory && subCategory.trim() !== "" ? subCategory : undefined;

//     let processedImages = [];
//     let videoFile = null;

//     // IMAGE projects
//     if (category !== "video" && req.files?.images) {
//       for (const file of req.files.images) {
//         const inputPath = file.path;

//         const buffer = await fs.promises.readFile(inputPath);
//         const metadata = await sharp(buffer).metadata();

//         const ratio = (metadata.width / metadata.height).toFixed(3);
//         const ext = path.extname(inputPath);
//         const folder = path.dirname(inputPath);
//         const newPath = path.join(folder, `${Date.now()}.${ratio}${ext}`);

//         await fs.promises.rename(inputPath, newPath);
//         processedImages.push(newPath);
//       }
//     }

//     // MEDIA (image / gif / video)
//     if (category === "video" && req.files?.videoFile) {
//       videoFile = req.files.videoFile[0].path;
//     }

//     const pdfFile = req.files?.pdfFile ? req.files.pdfFile[0].path : null;

//     if (toHomePage === "true" && homePageOrder) {
//       await Project.updateMany({ toHomePage: true, homePageOrder: { $gte: Number(homePageOrder) } }, { $inc: { homePageOrder: 1 } });
//     }

//     const project = new Project({
//       title,
//       category,
//       subCategory: cleanedSubCategory,
//       description,
//       contactDescription,
//       images: processedImages,
//       videoFile,
//       pdfFile,
//       isPrior: isPrior === "true" || isPrior === true,
//       toHomePage: toHomePage === "true" || toHomePage === true,
//       homePageOrder: homePageOrder ? Number(homePageOrder) : null,
//     });

//     await project.save();

//     res.status(201).json({
//       success: true,
//       message: "Project created successfully",
//       project,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// export const updateProject = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const project = await Project.findById(id);
//     if (!project) return res.status(404).json({ message: "Not found" });

//     Object.assign(project, req.body);

//     // IMAGE projects
//     if (project.category !== "video") {
//       let finalImages = [];

//       if (req.body.existingImages) {
//         finalImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
//       }

//       if (req.files?.images) {
//         for (const file of req.files.images) {
//           const inputPath = file.path;
//           const buffer = await fs.promises.readFile(inputPath);
//           const metadata = await sharp(buffer).metadata();

//           const ratio = (metadata.width / metadata.height).toFixed(3);
//           const ext = path.extname(inputPath);
//           const folder = path.dirname(inputPath);
//           const newPath = path.join(folder, `${Date.now()}.${ratio}${ext}`);

//           await fs.promises.rename(inputPath, newPath);
//           finalImages.push(newPath);
//         }
//       }

//       project.images = finalImages;
//     }

//     // MEDIA update
//     if (project.category === "video" && req.files?.videoFile) {
//       project.videoFile = req.files.videoFile[0].path;
//       project.images = [];
//     }

//     if (req.files?.pdfFile) {
//       project.pdfFile = req.files.pdfFile[0].path;
//     }

//     await project.save();

//     res.json({
//       success: true,
//       message: "Project updated successfully",
//       project,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const createProject = async (req, res) => {
  try {
    const { title, category, subCategory, description, contactDescription, isPrior, toHomePage, homePageOrder } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Title and category are required",
      });
    }

    const isHome = toHomePage === true || toHomePage === "true";
    const orderNum = homePageOrder ? Number(homePageOrder) : null;

    if (isHome && orderNum === RESERVED_HOME_ORDER) {
      return res.status(400).json({
        success: false,
        code: "RESERVED_HOME_ORDER",
        message: "Home page position 7 is reserved for Studio Text",
      });
    }

    const cleanedSubCategory = subCategory && subCategory.trim() !== "" ? subCategory : undefined;

    let processedImages = [];
    let videoFile = null;

    /* IMAGE PROJECT */
    if (category !== "video" && req.files?.images) {
      try {
        for (const file of req.files.images) {
          const buffer = await fs.promises.readFile(file.path);
          const metadata = await sharp(buffer).metadata();

          const ratio = (metadata.width / metadata.height).toFixed(3);
          const ext = path.extname(file.path);
          const folder = path.dirname(file.path);
          const newPath = path.join(folder, `${Date.now()}.${ratio}${ext}`);

          await fs.promises.rename(file.path, newPath);
          processedImages.push(newPath);
        }
      } catch {
        return res.status(500).json({
          success: false,
          code: "FILE_PROCESSING_ERROR",
          message: "Failed to process uploaded images",
        });
      }
    }

    /* VIDEO PROJECT */
    if (category === "video" && req.files?.videoFile) {
      videoFile = req.files.videoFile[0].path;
    }

    const pdfFile = req.files?.pdfFile?.[0]?.path ?? null;

    /* SHIFT HOMEPAGE ORDER */
    if (isHome && orderNum !== null) {
      await Project.updateMany(
        {
          toHomePage: true,
          homePageOrder: { $gte: orderNum, $ne: RESERVED_HOME_ORDER },
        },
        { $inc: { homePageOrder: 1 } },
      );
    }

    const project = new Project({
      title,
      category,
      subCategory: cleanedSubCategory,
      description,
      contactDescription,
      images: processedImages,
      videoFile,
      pdfFile,
      isPrior: isPrior === true || isPrior === "true",
      toHomePage: isHome,
      homePageOrder: orderNum,
    });

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Failed to create project",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        code: "PROJECT_NOT_FOUND",
        message: "Project does not exist",
      });
    }

    // ----------------- HOME PAGE ORDER -----------------
    const isHome = req.body.toHomePage === true || req.body.toHomePage === "true";
    const newOrder = req.body.homePageOrder !== undefined ? Number(req.body.homePageOrder) : null;

    if (isHome && newOrder === RESERVED_HOME_ORDER) {
      return res.status(400).json({
        success: false,
        code: "RESERVED_HOME_ORDER",
        message: "Home page position 7 is reserved and cannot be used",
      });
    }

    const oldOrder = project.homePageOrder;

    if (isHome && newOrder !== null && oldOrder !== null && newOrder !== oldOrder) {
      if (newOrder < oldOrder) {
        await Project.updateMany(
          {
            _id: { $ne: project._id },
            toHomePage: true,
            homePageOrder: { $gte: newOrder, $lt: oldOrder, $ne: RESERVED_HOME_ORDER },
          },
          { $inc: { homePageOrder: 1 } },
        );
      } else {
        await Project.updateMany(
          {
            _id: { $ne: project._id },
            toHomePage: true,
            homePageOrder: { $gt: oldOrder, $lte: newOrder, $ne: RESERVED_HOME_ORDER },
          },
          { $inc: { homePageOrder: -1 } },
        );
      }
    }

    // ----------------- ASSIGN BASIC FIELDS -----------------
    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.contactDescription = req.body.contactDescription ?? project.contactDescription;
    project.isPrior = req.body.isPrior === true || req.body.isPrior === "true";
    project.toHomePage = isHome;
    project.homePageOrder = isHome ? newOrder : null;
    project.category = req.body.category ?? project.category;
    project.subCategory = req.body.subCategory ?? project.subCategory;

    // ----------------- IMAGE PROJECTS -----------------
    if (project.category !== "video") {
      let finalImages = [];

      // Keep existing images if sent
      if (req.body.existingImages) {
        finalImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      }

      // Process uploaded images
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

      project.images = finalImages;
    }

    // ----------------- VIDEO PROJECT -----------------
    if (project.category === "video" && req.files?.videoFile) {
      project.videoFile = req.files.videoFile[0].path;
      project.images = []; // clear images if video
    }

    // ----------------- PDF FILE -----------------
    if (req.files?.pdfFile) {
      project.pdfFile = req.files.pdfFile[0].path;
    }

    await project.save();

    return res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Failed to update project",
    });
  }
};

const RESERVED_HOME_ORDER = 7;

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        code: "PROJECT_NOT_FOUND",
        message: "Project not found",
      });
    }

    if (project.toHomePage && project.homePageOrder === RESERVED_HOME_ORDER) {
      return res.status(400).json({
        success: false,
        code: "RESERVED_HOME_ORDER",
        message: "Studio Text (position 7) cannot be deleted",
      });
    }

    const deletedOrder = project.homePageOrder;

    await project.deleteOne();

    if (deletedOrder !== null) {
      await Project.updateMany(
        {
          toHomePage: true,
          homePageOrder: { $gt: deletedOrder, $ne: RESERVED_HOME_ORDER },
        },
        { $inc: { homePageOrder: -1 } },
      );
    }

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Failed to delete project",
    });
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
