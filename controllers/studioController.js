// import fs from "fs";
// import Studio from "../models/studioModel.js";

// // GET all studios, latest first
// export const getStudios = async (req, res) => {
//   try {
//     const studios = await Studio.find().sort({ createdAt: -1 });
//     res.status(200).json(studios);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching studios", error });
//   }
// };

// // GET a single studio by ID
// export const getStudioById = async (req, res) => {
//   try {
//     const studio = await Studio.findById(req.params.id);
//     if (!studio) return res.status(404).json({ message: "Studio not found" });
//     res.status(200).json(studio);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching studio", error });
//   }
// };

// // CREATE a new studio
// export const createStudio = async (req, res) => {
//   try {
//     if (req.fileValidationError) {
//       return res.status(400).json({ message: req.fileValidationError });
//     }

//     const { title, description, location, contact, email } = req.body;
//     const image = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;

//     const studio = new Studio({ title, description, location, contact, email, image });
//     await studio.save();
//     res.status(201).json({ message: "Studio created successfully", studio });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating studio", error });
//   }
// };

// // UPDATE an existing studio
// export const updateStudio = async (req, res) => {
//   try {
//     if (req.fileValidationError) {
//       return res.status(400).json({ message: req.fileValidationError });
//     }

//     const { title, description, location, contact, email } = req.body;
//     const updateData = { title, description, location, contact, email };
//     if (req.file) updateData.image = `/${req.file.path.replace(/\\/g, "/")}`;

//     const studio = await Studio.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!studio) return res.status(404).json({ message: "Studio not found" });

//     res.status(200).json({ message: "Studio updated successfully", studio });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating studio", error });
//   }
// };

// // DELETE a studio
// export const deleteStudio = async (req, res) => {
//   try {
//     const studio = await Studio.findById(req.params.id);

//     // Delete image file if exists
//     if (studio?.image) {
//       const filePath = studio.image.replace("/", "");
//       fs.existsSync(filePath) && fs.unlinkSync(filePath);
//     }

//     await Studio.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Studio deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting studio", error });
//   }
// };

import fs from "fs";
import Studio from "../models/studioModel.js";

/* ---------- GET ALL ---------- */
export const getStudios = async (req, res) => {
  try {
    const studios = await Studio.find().sort({ createdAt: -1 });
    res.status(200).json(studios);
  } catch (err) {
    res.status(500).json({ message: "Error fetching studios" });
  }
};

/* ---------- GET ONE ---------- */
export const getStudioById = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ message: "Studio not found" });
    res.json(studio);
  } catch {
    res.status(500).json({ message: "Error fetching studio" });
  }
};

/* ---------- CREATE ---------- */
export const createStudio = async (req, res) => {
  try {
    if (req.fileValidationError) return res.status(400).json({ message: req.fileValidationError });

    const { title, description, location, contact, email } = req.body;

    const studio = new Studio({
      title,
      description,
      location,
      contact,
      email,
      image: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : undefined,
    });

    await studio.save();
    res.status(201).json({ message: "Studio created", studio });
  } catch {
    res.status(500).json({ message: "Error creating studio" });
  }
};

/* ---------- UPDATE (REPLACE MEDIA) ---------- */
export const updateStudio = async (req, res) => {
  try {
    if (req.fileValidationError) return res.status(400).json({ message: req.fileValidationError });

    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ message: "Studio not found" });

    // delete old media if new uploaded
    if (req.file && studio.image) {
      const oldPath = studio.image.replace("/", "");
      fs.existsSync(oldPath) && fs.unlinkSync(oldPath);
    }

    Object.assign(studio, req.body);

    if (req.file) {
      studio.image = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    await studio.save();
    res.json({ message: "Studio updated", studio });
  } catch {
    res.status(500).json({ message: "Error updating studio" });
  }
};

/* ---------- DELETE ---------- */
export const deleteStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ message: "Studio not found" });

    if (studio.image) {
      const path = studio.image.replace("/", "");
      fs.existsSync(path) && fs.unlinkSync(path);
    }

    await studio.deleteOne();
    res.json({ message: "Studio deleted" });
  } catch {
    res.status(500).json({ message: "Error deleting studio" });
  }
};
