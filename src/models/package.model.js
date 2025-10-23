import mongoose from "mongoose";

const PackageProductSchema = new mongoose.Schema(
  {
    productObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const PackageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    mainPackageImage: {
      type: String,
      required: true,
    },

    packageBannerImages: {
      type: [String],
      default: [],
    },

    // 👉 Combination of products & variants inside package
    products: {
      type: [PackageProductSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one product is required in a package",
      },
    },

    description: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    discountPrice: {
      type: mongoose.Types.Decimal128,
      min: 0,
      default: 0,
    },

    originalPrice: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: 0,
    },

    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    tierObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
    },

    capacity: {
      type: Number,
      min: 0,
    },

    packageId: {
      type: String,
      unique: true,
      required: true,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    policy: String,
  },
  { timestamps: true }
);

PackageSchema.pre("save", function (next) {
    if (this.discountPercent === 0) {
        this.discountPrice = this.originalPrice
    }

    next();
})

const PackageModel = mongoose.model("PackageV1", PackageSchema);
export default PackageModel;
