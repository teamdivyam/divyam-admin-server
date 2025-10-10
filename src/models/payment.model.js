import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  provider: String, // "razorpay"
  amount: Number,
  currency: String,
  status: String,
  paymentMethod: String,
  transactionId: String, // razorpay_payment_id
});

const PaymentModel = mongoose.model("Payment", paymentSchema);
export default PaymentModel;