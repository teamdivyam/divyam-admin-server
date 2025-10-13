import mongoose from "mongoose";

export const PRODUCT_CATEGORY = {
  COOKING: "COOKING",
  DINING: "DINING",
  SERVING: "SERVING",
  DECORATIVE: "DECORATIVE",
  OTHERS: "OTHERS",
};

export const PRODUCT_STATUS = {
  active: "active",
  inactive: "inactive",
};

export const ProductType = {
  rental: "rental",
  sale: "sale",
};

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
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.active,
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
    enum: Object.values(PRODUCT_CATEGORY),
    default: PRODUCT_CATEGORY.OTHERS,
  },
  originalPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  discount: {
    type: Number,
    min: 0,
    default: 0,
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: 0,
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
    enum: Object.values(PRODUCT_STATUS),
    default: PRODUCT_STATUS.active,
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

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;

// import mongoose from "mongoose";

// export const ProductStatus = {
//   active: "active",
//   inactive: "inactive",
// }

// const ProductSchema = new mongoose.Schema(
//   {
//     sku: { type: String, required: true, unique: true, index: true },
//     slug: { type: String, required: true, unique: true, index: true },
//     name: { type: String, min: 4, max: 100 },
//     description: { type: String },
//     categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
//     variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
//     tags: [{ type: String, unique: true }],
//     attributes: { material: String, brand: String },
//     images: [{ type: String }],
//     status: { type: String, enum: Object.values(ProductStatus) },
//   },
//   { timestamps: true }
// );

// const ProductModel = mongoose.model("Product", ProductSchema);
// export default ProductModel;
