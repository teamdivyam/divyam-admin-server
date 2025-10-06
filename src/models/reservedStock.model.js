import mongoose from "mongoose";

const ReservedStockSchema = new mongoose.Schema(
  {
    skuId: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const ReservedStockModel = mongoose.model(
  "ReservedStock",
  ReservedStockSchema
);
export default ReservedStockModel;
