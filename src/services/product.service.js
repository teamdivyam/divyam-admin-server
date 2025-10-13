import ProductModel from "../models/product.model.js";

export const checkProductAvailability = async (res, req) => {
  // try {
  //     const { productList, checkDate, }
  // } catch (error) {
  //     console.error("error: service check product availability", error);
  //     throw error;
  // }
};

export const getTotalProduct = async () => {
  try {
    const result = await ProductModel.countDocuments({ status: "active" });

    return result;
  } catch (error) {
    console.error("error: service get total product", error);
    throw error;
  }
};
