import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    slug: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("Category", CategorySchema);
export default CategoryModel;
