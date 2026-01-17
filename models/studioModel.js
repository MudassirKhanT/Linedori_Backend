import mongoose from "mongoose";

const studioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    contact: { type: String },
    email: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Studio", studioSchema);
