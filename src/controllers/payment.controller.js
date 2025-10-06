import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import OrderModel from "../models/order.model.js";

const router = express.Router();

// Create Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 1️⃣ Create Order
router.post("/create-order", async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;

    // Create order in Razorpay
    const options = {
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      receipt: `${Date.now()}`,
    };

    const razorOrder = await razorpay.orders.create(options);

    // Save order in DB
    const order = await OrderModel.create({
      user: userId,
      items,
      totalAmount,
      razorpayOrderId: razorOrder.id,
    });

    res.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorOrder.id,
      amount: razorOrder.amount,
      currency: razorOrder.currency,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Order creation failed" });
  }
});

// 2️⃣ Verify Payment Signature
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await Payment.create({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "SUCCESS",
      });

      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "PAID", paymentId: razorpay_payment_id }
      );

      return res.json({ success: true });
    }

    res.status(400).json({ success: false, message: "Signature mismatch" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

export default router;
