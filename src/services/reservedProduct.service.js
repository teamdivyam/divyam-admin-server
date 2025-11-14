import ReservedProductModel from "../models/reserveProduct.model";

export const reservedProduct = async (productList) => {
  try {
    const reservedProductList = productList.map((product) => ({
      stockId: product.stockId,
      productId: product.productId,
      variantId: product.variantId,
      quantity: product.variantId,
      startDate: product.startDate,
      endDate: product.endDate,
    }));

    const reservedProductDocs = await ReservedProductModel.insertMany(
      reservedProductList
    );

    if (reservedProductDocs) {
      return { reservedProductDocs, success: true };
    }

    return { success: false };
  } catch (error) {
    console.error("error: reserved products!");
    throw error;
  }
};

export const checkProductAvailability = async ({
  stockIdList,
  fromData,
  endDate,
}) => {
  try {
  } catch (error) {
    console.error("error: service check product availability!");
    throw error;
  }
};
