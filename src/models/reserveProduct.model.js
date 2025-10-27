import mongoose from "mongoose";

const ReservedProductSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    productId: { type: mongoose.Schema.Types.ObjectId },
    variantId: String,
    quantity: Number,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const ReservedProductModel = mongoose.model(
  "Reservedstock",
  ReservedProductSchema
);
export default ReservedProductModel;
