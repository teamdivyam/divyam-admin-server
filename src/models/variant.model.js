import mongoose from "mongoose";

const SizeUnit = {
  inch: "inch",
  cm: "cm",
  mm: "mm",
  feet: "feet",
};

const WeightUnit = {
  kg: "kg",
  ml: "ml",
  litre: "litre",
};

const Status = {
    active: "active",
    inactive: "inactive",
}

const VariantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductV2" },
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, min: 4, max: 100 },
    attributes: {
      sizeUnit: Object.values(SizeUnit),
      size: String,
      weightUnit: Object.values(WeightUnit),
      weight: String,
    },
    originalPricePerDay: mongoose.Types.Decimal128,
    discountPercentage: { type: Number, min: 0, max: 100 },
    discountPricePerDay: mongoose.Types.Decimal128,
    totalStock: { type: Number, min: 0 },
    status: Object.values(Status),
  },
  { timestamps: true }
);

const VariantModel = mongoose.model("Variant", VariantSchema);
export default VariantModel;
