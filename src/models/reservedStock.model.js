import mongoose from "mongoose";

const ReservedStockSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    quantity: Number,
  },
  { timestamps: true }
);

const ReservedStockModel = mongoose.model(
  "ReservedStock",
  ReservedStockSchema
);
export default ReservedStockModel;
