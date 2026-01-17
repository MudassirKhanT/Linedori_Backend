import Team from "../models/Team.js";
import fs from "fs";
import path from "path";
export const createTeamMember = async (req, res) => {
  try {
    const { name, role, description } = req.body;

    const image = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;

    const member = await Team.create({
      name,
      role,
      description,
      image,
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const members = await Team.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { name, role, description } = req.body;

    const updateData = { name, role, description };

    if (req.file) {
      updateData.image = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const updated = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);

    if (!member) return res.status(404).json({ message: "Team member not found" });

    // Delete image if exists
    if (member.image) {
      const filePath = path.join(process.cwd(), member.image); // absolute path
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Team.findByIdAndDelete(req.params.id);

    res.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};

// export const deleteTeamMember = async (req, res) => {
//   try {
//     const member = await Team.findById(req.params.id);

//     if (member?.image) {
//       const filePath = member.image.replace("/", "");
//       fs.existsSync(filePath) && fs.unlinkSync(filePath);
//     }

//     await Team.findByIdAndDelete(req.params.id);
//     res.json({ message: "Team member deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
