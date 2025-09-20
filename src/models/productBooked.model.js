import mongoose from "mongoose";

const ProductBookedSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
  },
  { timestamp: true }
);

const ProductBookedModel = mongoose.Model("ProductBooked", ProductBookedSchema);
export default ProductBookedModel;
