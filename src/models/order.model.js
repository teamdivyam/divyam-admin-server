import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "PackageV1"  },
  products: [
    {
      product: String,
      sku: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  additionalProducts: [
    {
      productId: String,
      sku: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  fromDate: { type: Date },
  toDate: { type: Date },
  referral: {
    code: String,
    id: { type: mongoose.Schema.Types.ObjectId, ref: "ReferralUsers" },
  },
  totalAmount: Number,
  currency: { type: String, default: "INR" },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING",
  },
  shippingAddress: {
    area: { type: String },
    landMark: { type: String },
    city: { type: String },
    state: { type: String },
    contactNumber: { type: Number },
    pinCode: { type: String },
    area: { type: String },
    isActive: { type: Boolean, default: false },
  },
  razorpayOrderId: String,
  paymentId: String,
  createdAt: { type: Date, default: Date.now },
});

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;
