import mongoose from "mongoose";

const ShippingAddressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    area: { type: String, },
    landMark: { type: String, },
    city: { type: String },
    state: { type: String },
    contactNumber: { type: Number },
    pinCode: { type: String },
    area: { type: String },
    isActive: { type: Boolean, default: false }
});

const ShippingAddressModel = mongoose.model("ShippingAddress", ShippingAddressSchema);
export default ShippingAddressModel;