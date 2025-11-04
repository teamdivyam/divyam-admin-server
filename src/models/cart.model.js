import mongoose from "mongoose";

const ProductCartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
    },
    variantId: String,
    quantity: { type: Number, min: 1, default: 1 },
    // productId: {
    //   type: String,
    //   required: true,
    // },
    // sku: String,
    // productName: String,
    // variantName: String,
    // slug: String,
    // productImage: String,
    // availableQuantity: { type: Number },
    // originalPrice: Number,
    // discount: Number,
    // discountPrice: Number,
  },
  {
    _id: false,
  }
);

const PackageCartSchema = new mongoose.Schema(
  {
    packageId: {
      type: String,
      required: true,
    },
    quantity: { type: String, min: 1, default: 1 },
    originalPrice: Number,
    discount: Number,
    discountPrice: Number,
    slug: String,
    packageImage: String,
  },
  {
    _id: false,
  }
);

const CartSchema = new mongoose.Schema(
  {
    cartId: { type: String, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    productCartList: [{ type: ProductCartSchema, default: [] }],
    packageCartList: [{ type: PackageCartSchema, default: [] }],
    subTotal: Number,
    total: Number,
  },
  {
    timestamps: true,
  }
);

const CartModel = mongoose.model("Cart", CartSchema);
export default CartModel;