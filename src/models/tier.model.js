import mongoose from "mongoose";

const TierSchema = new mongoose.Schema({
  tierName: { type: String, required: true, unique: true },
}, { timestamps: true});

const TierModel = mongoose.model("Tier", TierSchema);

export default TierModel;
