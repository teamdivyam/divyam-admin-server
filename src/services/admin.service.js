import UserModel from "../Users/userModel.js";

export const getTotalUser = async () => {
  try {
    const result = await UserModel.countDocuments({});

    return result;
  } catch (error) {
    throw error;
  }
};

export const getTotalUserSignupLastXDay = async (X) => {
  try {
    const today = new Date();
    const XDaysAgo = new Date(today);

    XDaysAgo.setDate(today.getDate() - X);

    const result = await UserModel.countDocuments({
      createdAt: { $gt: XDaysAgo },
    });

    return result;
  } catch (error) {
    throw error;
  }
};
