import CartModel from "../models/cart.model.js";
import convertDecimal from "../utils/convertDecimal.js";

export const getUserCart = async (userId) => {
  try {
    let cart = await CartModel.findOne({ userId: userId })
      .select(`-_id packageCartList productCartList subTotal total`)
      .populate({
        path: "productCartList.product",
        select: `-_id slug name mainImage status productId variants.variantId 
        variants.variantName variants.originalPrice variants.discount 
        variants.discountPrice`,
      })
      .populate({ path: "productCartList.stock", select: "-_id sku quantity" })
      .lean();

    const productCartList = cart.productCartList.map((product) => {
      const variant = product.product.variants.find(
        (variant) => variant.variantId === product.variantId
      );
      
      return {
        availableQuantity: product.stock.quantity,
        discount: variant.discount,
        discountPrice: variant.discountPrice,
        originalPrice: variant.originalPrice,
        productId: product.product.productId,
        productImage: product.product.mainImage,
        productName: product.product.name,
        quantity: product.quantity,
        sku: product.stock.sku,
        slug: product.product.slug,
        status: product.product.status,
        variantId: variant.variantId,
        variantName: variant.variantName,
      };
    });

    cart = {
      ...cart,
      productCartList: productCartList,
      packageCartList: cart.packageCartList,
      subTotal: cart.subTotal,
      total: cart.total,
    };

    cart = convertDecimal(cart);

    return cart;
  } catch (error) {
    throw error;
  }
};

export const calculateCartPrice = async (cartId) => {
  try {
    const cart = await CartModel.findOne({ cartId })
      .select(`packageCartList productCartList`)
      .populate({
        path: "productCartList.product",
        select: "variants",
      });

    const cartSubTotalProduct = cart.productCartList.reduce((sum, product) => {
      const variant = product.product.variants.find(
        (variant) => variant.variantId === product.variantId
      );

      return sum + variant.discountPrice * product.quantity;
    }, 0);

    const cartSubTotalPackage = cart.packageCartList.reduce((sum, item) => {
      return sum + item.discountPrice * item.quantity;
    }, 0);

    return (
      Number(cartSubTotalPackage.toFixed(2)) +
      Number(cartSubTotalProduct.toFixed(2))
    );
  } catch (error) {
    throw error;
  }
};