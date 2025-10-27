import mongoose from "mongoose";
import {
  Currency,
  discountType,
  OrderStatus,
  PaymentMethods,
  PaymentStatus,
  RecurringPaymentStatus,
} from "../utils/modelConstants";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "PackageV1" },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantId: String,
        quantity: Number,
      },
    ],
    date: {
      delivery: Date,
      pickup: Date,
      eventStart: Date,
      eventEnd: Date,
    },
    referral: {
      code: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "ReferralUsers" },
    },
    total: {
      subTotal: Number,
      discount: {
        type: { type: String, enum: Object.values(discountType) },
        amount: Number,
      },
      shipping: Number,
      taxes: Number,
      finalTotal: Number,
    },
    payment: {
      currency: { type: String, enum: Object.values(Currency), default: "INR" },
      advancedPayment: {
        amount: Number,
        status: {
          type: String,
          enum: Object.values(PaymentStatus),
          default: PaymentStatus.pending,
        },
        paymentMethod: {
          type: String,
          enum: Object.values(PaymentMethods),
          default: PaymentMethods.others,
        },
        details: {
          razorpayPaymentId: String,
          razorpayOrderId: String,
          razorpaySignature: String,
        },
      },
      balancePayment: {
        amount: Number,
        status: {
          type: String,
          enum: Object.values(PaymentStatus),
          default: PaymentStatus.pending,
        },
        paymentMethod: {
          type: String,
          enum: Object.values(PaymentMethods),
          default: PaymentMethods.others,
        },
        details: {
          razorpayPaymentId: String,
          razorpayOrderId: String,
          razorpaySignature: String,
        },
      },
      fullPayment: {
        amount: Number,
        status: {
          type: String,
          enum: Object.values(PaymentStatus),
          default: PaymentStatus.pending,
        },
        paymentMethod: {
          type: String,
          enum: Object.values(PaymentMethods),
          default: PaymentMethods.others,
        },
        details: {
          razorpayPaymentId: String,
          razorpayOrderId: String,
          razorpaySignature: String,
        },
      },
      recurringPaymentStatus: {
        type: String,
        enum: Object.values(RecurringPaymentStatus),
        default: RecurringPaymentStatus.pending,
      },
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.pending,
    },
    shippingAddress: {
      fullName: String,
      email: String,
      phoneNo: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pinCode: String,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;
