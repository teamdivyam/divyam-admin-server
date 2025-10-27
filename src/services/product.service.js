import ProductModel from "../models/product.model.js";
import StockModel from "../models/stock.model.js";
import generateVariantID from "../utils/generateVariantID.js";
import { ProductType } from "../utils/modelConstants.js";

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

export const processedVariantObject = async (validData) => {
  try {
    const result = await Promise.all(
      validData.variants.map(async (variant) => {
        const stock = await StockModel.findById(variant.stock);

        // Add basic info
        const processed = {
          ...variant,
          variantId: generateVariantID(),
          variantName: stock.name,
          price: {}, // initialize price object
        };

        // Add nested price object based on product type
        if (validData.productType === ProductType.rental) {
          processed.price.rental = {
            price: variant.originalPrice,
            discount: variant.discount,
            discountPrice: variant.discountPrice,
          };
        } else if (validData.productType === ProductType.sale) {
          processed.price.sale = {
            price: variant.originalPrice,
            discount: variant.discount,
            discountPrice: variant.discountPrice,
          };
        }

        // Remove unnecessary fields
        // delete processed.originalPrice;
        // delete processed.discountPrice;
        // delete processed.discount;

        return processed;
      })
    );

    return result;
  } catch (error) {
    console.error("error: structure variant object:", error);
    throw error;
  }
};
