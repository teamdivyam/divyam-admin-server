import createHttpError from "http-errors";
import CartModel from "../models/cart.model.js";
import { UpdateCartResponseBodySchema } from "../Validators/cart.js";
import ProductModel from "../models/product.model.js";
import StockModel from "../models/stock.model.js";
import { generateCartID } from "../utils/generateID.js";
import PackageModel from "../models/package.model.js";
import { calculateCartPrice, getUserCart } from "../services/cart.service.js";

const CartController = {
  getUserCart: async (req, res, next) => {
    try {
      const userId = req.user?.id || "68c3cb85a9c5ba595313aa9a";
      const cart = await getUserCart(userId);

      res.status(200).json({
        success: true,
        cart: cart,
        message: cart ? "Cart is full! Checkout" : "Your cart is empty",
      });
    } catch (error) {
      console.error("error get cart:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  addItemInCart: async (req, res, next) => {
    try {
      const userId = req.user?.id || "68c3cb85a9c5ba595313aa9a";

      const { error, value } = UpdateCartResponseBodySchema.validate(req.body, {
        stripUnkown: true,
      });
      if (error) {
        const errorMessage = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          type: detail.type,
        }));
        return next(
          createHttpError(400, "Validation failed", {
            errors: errorMessage,
          })
        );
      }
      const { itemType, itemId, variantId, quantity } = value;

      let userCart = await CartModel.findOne({ userId: userId });
      if (!userCart) {
        const cartId = generateCartID();
        userCart = await CartModel.create({ userId: userId, cartId: cartId });
      }

      if (itemType === "package") {
        /** Cart Package */
        const isItemAlreadyInCart = userCart.packageCartList.find(
          (item) => item.packageId === itemId
        );
        if (isItemAlreadyInCart) {
          return next(createHttpError(409, "Item in cart already existed!"));
        }

        const packageData = await PackageModel.findOne({ packageId: itemId });

        userCart.packageCartList.push({
          packageId: itemId,
          quantity: quantity,
          originalPrice: packageData.originalPrice,
          discountPrice: packageData.discountPrice,
          discount: packageData.discountPercent,
          slug: packageData.slug,
          packageImage: packageData.mainPackageImage,
        });
      } else if (itemType === "product" && variantId) {
        /** Cart Product with Variant */
        const isVariantAlreadyInCart = userCart.productCartList.find(
          (item) => item.variantId === variantId
        );
        if (isVariantAlreadyInCart) {
          return next(createHttpError(409, "Variant in cart already existed!"));
        } else {
          const product = await ProductModel.findOne({ productId: itemId });
          const productVariant = product.variants.find(
            (variant) => variant.variantId === variantId
          );

          userCart.productCartList.push({
            product: product._id,
            stock: productVariant.stock,
            variantId: variantId,
            quantity: quantity,
          });
        }
      }

      await userCart.save();

      const subTotal = await calculateCartPrice(userCart.cartId);
      userCart.subTotal = subTotal;
      userCart.total = subTotal;

      await userCart.save();

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("error add in cart:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  updateItemInCart: async (req, res, next) => {
    try {
      const userId = req.user?.id || "68c3cb85a9c5ba595313aa9a";
      const { itemType, itemId, variantId, quantity, action } = req.body;

      const userCart = await CartModel.findOne({ userId: userId });

      if (itemType === "package") {
        /** Cart Package */
        // const editItemIndex = userCart.packageCartList.findIndex(
        //   (item) => item.packageId === itemId
        // );
      } else {
        /** Cart Product  */
        if (itemId && !variantId) {
          /** Product with No Variant
           * Find item index in ProductCartList with productId to change and based on
           * action type increment or decrement
           */
          const editItemIndex = userCart.productCartList.findIndex(
            (item) => item.productId === itemId
          );

          if (action === "increment") {
            userCart.productCartList[editItemIndex].quantity += quantity;
          } else {
            // Action type: decrement
            if (quantity > userCart.productCartList[i].quantity) {
              return next(createHttpError(409, "Item in cart not existed!"));
            }
            userCart.productCartList[editItemIndex].quantity -= quantity;
          }
        } else {
          /** Product with Variant
           * Find item index in ProductCartList with variantId to change and based on
           * action type increment or decrement
           */
          const editItemIndex = userCart.productCartList.findIndex(
            (item) => item.variantId === variantId
          );

          if (action === "increment") {
            userCart.productCartList[editItemIndex].quantity += quantity;
          } else {
            // Action type: decrement
            if (quantity > userCart.productCartList[editItemIndex].quantity) {
              return next(createHttpError(409, "Item in cart not existed!"));
            }
            userCart.productCartList[editItemIndex].quantity -= quantity;
          }
        }
      }

      await userCart.save();

      const subTotal = await calculateCartPrice(userCart.cartId);
      userCart.subTotal = subTotal;
      userCart.total = subTotal;

      await userCart.save();

      res.status(201).json({
        success: true,
        userCart: userCart,
      });
    } catch (error) {
      console.error("error update in cart:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  deleteItemInCart: async (req, res, next) => {
    try {
      const userId = req.user?.id || "68c3cb85a9c5ba595313aa9a";
      const { itemType, itemId, variantId } = req.body;

      const userCart = await CartModel.findOne({ userId: userId });

      if (itemType === "package") {
        /** Cart Package */
        const filterPackageCartList = userCart.packageCartList.filter(
          (item) => item.packageId !== itemId
        );

        userCart.packageCartList = filterPackageCartList;
      } else if (itemType === "product" && variantId) {
        /** Cart Product with Variant */
        const filterProductCartList = userCart.productCartList.filter(
          (item) => item.variantId !== variantId
        );

        userCart.productCartList = filterProductCartList;
      } else {
        /** Cart Product with no Variant */
        const filterProductCartList = userCart.productCartList.filter(
          (item) => item.productId !== itemId
        );

        userCart.productCartList = filterProductCartList;
      }

      await userCart.save();

      const subTotal = await calculateCartPrice(userCart.cartId);
      userCart.subTotal = subTotal;
      userCart.total = subTotal;

      await userCart.save();

      res.status(201).json({
        success: true,
        userCart: userCart,
      });
    } catch (error) {
      console.error("error update in cart:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
};

export default CartController;
