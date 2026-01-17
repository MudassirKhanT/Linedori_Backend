import fs from "fs";
import Press from "../models/Press.js";

export const createPress = async (req, res) => {
  try {
    const { title, description, date, link } = req.body;

    const image = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;

    const press = await Press.create({
      title,
      description,
      date,
      link,
      image,
    });

    res.status(201).json(press);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPress = async (req, res) => {
  try {
    const press = await Press.find().sort({ createdAt: -1 });
    res.json(press);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePress = async (req, res) => {
  try {
    const { title, description, date, link } = req.body;

    const updateData = { title, description, date, link };

    if (req.file) {
      updateData.image = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const updated = await Press.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePress = async (req, res) => {
  try {
    const press = await Press.findById(req.params.id);

    if (press?.image) {
      const filePath = press.image.replace("/", "");
      fs.existsSync(filePath) && fs.unlinkSync(filePath);
    }

    await Press.findByIdAndDelete(req.params.id);
    res.json({ message: "Press deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
