import mongoose from "mongoose";
import {
  Category,
  ProductStatus,
  ProductType,
} from "../utils/modelConstants.js";

const VariantSchema = new mongoose.Schema(
  {
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    variantId: { type: String, unique: true, sparse: true },
    variantName: String,
    originalPrice: {
      type: mongoose.Types.Decimal128,
      set: (v) => mongoose.Types.Decimal128.fromString(v?.toString() || "0"),
      get: (v) => parseFloat(v?.toString() || 0),
    },
    discount: { type: Number, min: 0, max: 95, default: 0 },
    discountPrice: {
      type: mongoose.Types.Decimal128,
      set: (v) => mongoose.Types.Decimal128.fromString(v?.toString() || "0"),
      get: (v) => parseFloat(v?.toString() || 0),
    },
    // Update Properties
    price: {
      rental: {
        price: {
          type: mongoose.Types.Decimal128,
          set: (v) =>
            mongoose.Types.Decimal128.fromString(v?.toString() || "0"),
          get: (v) => parseFloat(v?.toString() || 0),
        },
        discount: { type: Number, min: 0, max: 95, default: 0 },
        discountPrice: {
          type: mongoose.Types.Decimal128,
          set: (v) =>
            mongoose.Types.Decimal128.fromString(v?.toString() || "0"),
          get: (v) => parseFloat(v?.toString() || 0),
        },
      },
      sale: {
        price: {
          type: mongoose.Types.Decimal128,
          set: (v) =>
            mongoose.Types.Decimal128.fromString(v?.toString() || "0"),
          get: (v) => parseFloat(v?.toString() || 0),
        },
        discount: { type: Number, min: 0, max: 95, default: 0 },
        discountPrice: {
          type: mongoose.Types.Decimal128,
          set: (v) =>
            mongoose.Types.Decimal128.fromString(v?.toString() || "0"),
          get: (v) => parseFloat(v?.toString() || 0),
        },
      },
      tax: { type: Number, min: 0, max: 28, default: 0 },
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.active,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema({
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  slug: { type: String, unique: true },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: Object.values(Category),
    default: Category.others,
  },
  mainImage: {
    type: String,
  },
  images: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.active,
  },
  variants: [
    {
      type: VariantSchema,
      default: [],
    },
  ],
  productType: {
    type: String,
    enum: Object.values(ProductType),
    default: ProductType.rental,
  },
});

ProductSchema.set("toJSON", { getters: true });
ProductSchema.set("toObject", { getters: true });

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;
