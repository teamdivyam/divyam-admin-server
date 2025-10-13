import PackageModel from "../models/package.model.js";

export const getTotalPackage = async () => {
  try {
    const result = await PackageModel.countDocuments({ isVisible: true });

    return result;
  } catch (error) {
    console.error("error getting dashboard analytics:", error);
    throw error;
  }
};
