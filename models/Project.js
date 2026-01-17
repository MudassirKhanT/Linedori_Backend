import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["Architecture", "Interior", "Objects", "Exhibition", "video"],
      required: true,
    },
    subCategory: {
      type: String,
      enum: ["Residential", "Commercial", "All", "Lighting", "Furniture", "none"],
    },
    description: { type: String },
    images: [{ type: String }],
    pdfFile: { type: String },
    videoFile: { type: String },
    contactDescription: { type: String },

    isPrior: { type: Boolean, default: false },
    toHomePage: { type: Boolean, default: false },
    homePageOrder: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
