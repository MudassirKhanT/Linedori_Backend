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

// export const deleteProject = async (req, res) => {
//   try {
//     await Project.findByIdAndDelete(req.params.id);
//     res.json({ message: "Project deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const createProject = async (req, res) => {
  try {
    const { title, category, subCategory, description, contactDescription, isPrior, toHomePage, homePageOrder } = req.body;

    const isHome = toHomePage === "true" || toHomePage === true;
    const orderNum = homePageOrder ? Number(homePageOrder) : null;

    // ❌ Block reserved slot
    if (isHome && orderNum === RESERVED_HOME_ORDER) {
      return res.status(400).json({
        success: false,
        message: "Home page order 7 is reserved for Studio Text",
      });
    }

    const cleanedSubCategory = subCategory && subCategory.trim() !== "" ? subCategory : undefined;

    let processedImages = [];
    let videoFile = null;

    /* ---------------- IMAGE PROJECTS ---------------- */
    if (category !== "video" && req.files?.images) {
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

    /* ---------------- VIDEO PROJECT ---------------- */
    if (category === "video" && req.files?.videoFile) {
      videoFile = req.files.videoFile[0].path;
    }

    const pdfFile = req.files?.pdfFile ? req.files.pdfFile[0].path : null;

    /* ---------------- SHIFT HOMEPAGE ORDER (SKIP 9) ---------------- */
    if (isHome && orderNum !== null) {
      await Project.updateMany(
        {
          toHomePage: true,
          homePageOrder: {
            $gte: orderNum,
            $ne: RESERVED_HOME_ORDER,
          },
        },
        { $inc: { homePageOrder: 1 } },
      );
    }

    /* ---------------- CREATE PROJECT ---------------- */
    const project = new Project({
      title,
      category,
      subCategory: cleanedSubCategory,
      description,
      contactDescription,
      images: processedImages,
      videoFile,
      pdfFile,
      isPrior: isPrior === "true" || isPrior === true,
      toHomePage: isHome,
      homePageOrder: orderNum,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isHome = req.body.toHomePage === true || req.body.toHomePage === "true";

    const newOrder = req.body.homePageOrder !== undefined ? Number(req.body.homePageOrder) : null;

    // ❌ Reserved slot protection
    if (isHome && newOrder === RESERVED_HOME_ORDER) {
      return res.status(400).json({
        message: "Home page order 7 is reserved for Studio Text",
      });
    }

    const oldOrder = project.homePageOrder;

    // 🔁 Reorder only when needed
    if (isHome && newOrder !== null && oldOrder !== null && newOrder !== oldOrder) {
      // 🔼 Moving UP
      if (newOrder < oldOrder) {
        await Project.updateMany(
          {
            _id: { $ne: project._id },
            toHomePage: true,
            homePageOrder: {
              $gte: newOrder,
              $lt: oldOrder,
              $ne: RESERVED_HOME_ORDER,
            },
          },
          { $inc: { homePageOrder: 1 } },
        );
      }

      // 🔽 Moving DOWN
      if (newOrder > oldOrder) {
        await Project.updateMany(
          {
            _id: { $ne: project._id },
            toHomePage: true,
            homePageOrder: {
              $gt: oldOrder,
              $lte: newOrder,
              $ne: RESERVED_HOME_ORDER,
            },
          },
          { $inc: { homePageOrder: -1 } },
        );
      }
    }

    // ✅ Assign fields safely
    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.contactDescription = req.body.contactDescription ?? project.contactDescription;
    project.isPrior = req.body.isPrior === true || req.body.isPrior === "true";
    project.toHomePage = isHome;
    project.homePageOrder = isHome ? newOrder : null;

    await project.save();

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const RESERVED_HOME_ORDER = 7;

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ❌ Block reserved slot deletion
    if (project.toHomePage && project.homePageOrder === RESERVED_HOME_ORDER) {
      return res.status(400).json({
        message: "Studio Text (order 7) cannot be deleted",
      });
    }

    const deletedOrder = project.homePageOrder;

    await project.deleteOne();

    // 🔁 Rebalance homepage order
    if (deletedOrder !== null) {
      await Project.updateMany(
        {
          toHomePage: true,
          homePageOrder: {
            $gt: deletedOrder,
            $ne: RESERVED_HOME_ORDER,
          },
        },
        { $inc: { homePageOrder: -1 } },
      );
    }

    res.json({
      success: true,
      message: "Project deleted and homepage order rebalanced",
    });
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
