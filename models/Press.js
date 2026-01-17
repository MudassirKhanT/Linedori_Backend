import mongoose from "mongoose";

const pressSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  image: { type: String },
  link: { type: String },
});

export default mongoose.model("Press", pressSchema);
