import mongoose from "mongoose";

export const Category = {
  cooking: "cooking",
  dining: "dining",
  serving: "serving",
  decoration: "decoration",
  others: "others",
};

export const StockStatus = {
  active: "active",
  inactive: "inactive",
};

export const SizeUnit = {
  inch: "inch",
  cm: "cm",
  mm: "mm",
};

export const WeightUnit = {
  kg: "kg",
  gram: "gram",
};

export const CapacityUnit = {
  ltr: "ltr",
  ml: "ml"
}

const StockSchema = new mongoose.Schema(
  {
    parentStockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
    },
    sku: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(Category),
      default: Category.others,
    },
    quantity: Number,
    status: {
      type: String,
      enum: Object.values(StockStatus),
      default: StockStatus.active,
    },
    isVariant: { type: Boolean, default: false },
    attributes: {
      weightUnit: { type: String, enum: Object.values(WeightUnit) },
      sizeUnit: { type: String, enum: Object.values(SizeUnit) },
      capacityUnit: { type: String, enum: Object.values(CapacityUnit) },
      weight: String,
      size: String,
      capacity: String,
    },
    guestCapacity: Number,
    remarks: String,
  },
  {
    timestamps: true,
  }
);

const StockModel = mongoose.model("Stock", StockSchema);
export default StockModel;
