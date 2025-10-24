import createHttpError from "http-errors";
import StockModel, { Category } from "../models/stock.model.js";
import {
  // VariantUpdateValidationSchema,
  AddNewStockSchema,
  AddNewStockVariantSchema,
} from "../Validators/stock.js";
import {
  checkStockAlreadyExists,
  createStockSingleVariant,
  getAllStocks,
  getStockQuantity,
  getTotalStocks,
  getVariantStockQuantity,
} from "../services/stock.js";
import generateStockId from "../utils/generateStockID.js";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";

const StockController = {
  getStock: async (req, res, next) => {
    try {
      const [stocks, totalStocks, totalVariantStocks] = await Promise.all([
        getAllStocks(),
        getStockQuantity(),
        getVariantStockQuantity(),
      ]);

      const category = {
        values: Object.values(Category),
        totalCategory: Object.values(Category).length,
      };

      res.status(200).json({
        success: true,
        stocks: stocks,
        totalStocks: totalStocks,
        totalVariantStocks: totalVariantStocks,
        category: category,
      });
    } catch (error) {
      console.error("error in getting stock:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  getSingleStock: async (req, res, next) => {
    try {
      const { sku } = req.params;

      const stock = await StockModel.findOne({ sku });

      // Variant stock of stock
      const variantStock = await StockModel.find({
        parentStockId: stock._id,
      }).lean();

      // Total quantity of stock
      const totalQuantity = variantStock.reduce((sum, variant) => {
        return sum + variant.quantity;
      }, 0);

      res.status(200).json({
        success: true,
        stock: stock,
        variantStock: variantStock,
        totalQuantity: totalQuantity,
      });
    } catch (error) {
      console.error("error in getting single stock:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  getStockVariantOptions: async (req, res, next) => {
    try {
      const usedStockIdsInProduct = await ProductModel.distinct("stock");

      const options = await StockModel.find({
        parentStockObjectId: null,
        isVariant: false,
        _id: { $nin: usedStockIdsInProduct },
      }).select("name sku category");

      // const availableStocks = await StockModel.aggregate([
      //   {
      //     $match: {
      //       parentStockObjectId: null,
      //       isVariant: false,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "products",
      //       localField: "_id",
      //       foreignField: "stock",
      //       as: "linkedProduct",
      //     },
      //   },
      //   {
      //     $match: {
      //       linkedProduct: { $size: 0 }, // keep only those with no linked product
      //     },
      //   },
      //   {
      //     $project: {
      //       name: 1,
      //       sku: 1,
      //       category: 1,
      //       linkedProduct: 1,
      //     },
      //   },
      // ]);

      res.status(200).json({
        success: true,
        options: options,
        // availableStocks: availableStocks
      });
    } catch (error) {
      console.error("error in getting single stock:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  createStock: async (req, res, next) => {
    try {
      const { isStockHasVariants, isVariantParentAlreadyExists } = req.query;

      /** True if stock has no variants */
      if (isStockHasVariants === "false") {
        const { error, value: validatedData } = AddNewStockSchema.validate(
          req.body,
          { abortEarly: false, stripUnknown: true } // Remove Unknown Fields
        );
        if (error) {
          const errorMessage = error.details.map((detail) => detail.message);
          return next(
            createHttpError(400, "Validation failed", {
              validationErrorList: errorMessage,
            })
          );
        }

        if (await checkStockAlreadyExists(validatedData.name)) {
          return next(
            createHttpError(409, {
              message: `${validatedData.name} name stock already existed`,
            })
          );
        }

        const sku = generateStockId(validatedData.category);

        await StockModel.create({
          sku: sku,
          name: validatedData.name,
          category: validatedData.category,
          quantity: validatedData.quantity,
          attributes: {
            weightUnit: validatedData.weightUnit,
            sizeUnit: validatedData.sizeUnit,
            capacitytUnit: validatedData.capacityUnit,
            weight: validatedData.weight,
            size: validatedData.size,
            capacity: validatedData.capacity,
          },
          guestCapacity: validatedData.guestCapacity,
          remarks: validatedData.remarks,
        });

        return res.status(201).json({ message: "New stock created" });
      } else {
        /** True if stock has variants */
        /** True if parent stock has already exists */
        if (isVariantParentAlreadyExists === "true") {
          const { error, value: validatedData } =
            AddNewStockVariantSchema.validate(req.body, {
              abortEarly: false, // return all validation error at once
              stripUnknown: true, // remove unknown field
            });
          if (error) {
            const errorMessage = error.details.map((detail) => detail.message);
            return next(
              createHttpError(400, "Validation failed", {
                validationErrorList: errorMessage,
              })
            );
          }

          if (await checkStockAlreadyExists(validatedData.variantStockName)) {
            return next(createHttpError(409, "Stock already existed"));
          }

          const skuVarientStock = generateStockId(
            validatedData.variantStockCategory
          );

          await StockModel.create({
            parentStockId: validatedData.parentStockId,
            sku: skuVarientStock,
            name: validatedData.variantStockName,
            category: validatedData.variantStockCategory,
            isVariant: true,
            attributes: {
              weightUnit: validatedData.variantStockWeightUnit,
              sizeUnit: validatedData.variantStockSizeUnit,
              capacityUnit: validatedData.variantStockCapacityUnit,
              weight: validatedData.variantStockWeight,
              size: validatedData.variantStockSize,
              capacity: validatedData.variantStockCapacity,
            },
            guestCapacity: validatedData.variantStockGuestCapacity,
            remarks: validatedData.variantRemarks,
            quantity: validatedData.variantStockQuantity,
          });

          return res.status(201).json({
            success: true,
            message: "Stock created successfully",
          });
        }

        /** True if parent stock not available */
        if (isVariantParentAlreadyExists === "false") {
          const { error, value: validatedData } =
            AddNewStockVariantSchema.validate(req.body, {
              abortEarly: false, // return all validation error at once
              stripUnknown: true, // remove unknown field
            });
          if (error) {
            const errorMessage = error.details.map((detail) => detail.message);
            return next(
              createHttpError(400, "Validation failed", {
                validationErrorList: errorMessage,
              })
            );
          }

          // First Create Parent Stock
          if (await checkStockAlreadyExists(validatedData.parentStockName)) {
            return next(createHttpError(409, "Stock already existed"));
          }
          const skuParentStock = generateStockId(
            validatedData.parentStockCategory
          );

          const parentStock = await StockModel.create({
            sku: skuParentStock,
            name: validatedData.parentStockName,
            category: validatedData.parentStockCategory,
          });

          // Second Create Varient Stock
          if (await checkStockAlreadyExists(validatedData.variantStockName)) {
            return next(createHttpError(409, "Variant Stock already existed"));
          }

          const skuVarientStock = generateStockId(
            validatedData.variantStockCategory
          );

          await StockModel.create({
            parentStockId: parentStock._id,
            sku: skuVarientStock,
            name: validatedData.variantStockName,
            category: validatedData.variantStockCategory,
            isVariant: true,
            attributes: {
              weightUnit: validatedData.variantStockWeightUnit,
              sizeUnit: validatedData.variantStockSizeUnit,
              capacityUnit: validatedData.variantStockCapacityUnit,
              weight: validatedData.variantStockWeight,
              size: validatedData.variantStockSize,
              capacity: validatedData.variantStockCapacity,
            },
            guestCapacity: validatedData.variantStockGuestCapacity,
            remarks: validatedData.variantRemarks,
            quantity: validatedData.variantStockQuantity,
          });

          return res.status(201).json({
            success: true,
            message: "Stock created successfully",
          });
        }
      }
    } catch (error) {
      console.error("error in creating single stock:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  // createStockWithVariant: async (req, res, next) => {
  //     try {
  //         const { error, value: validatedData } = StockSchema.validate(
  //             req.body,
  //             { stripUnknown: true } // Remove Unknown Fields
  //         );

  //         if (error) {
  //             // Create a detailed error message
  //             const errorMessage = error.details.map((detail) => ({
  //                 field: detail.path.join("."),
  //                 message: detail.message,
  //                 type: detail.type,
  //             }));

  //             // Send HTTP 400 error with validation details
  //             return next(
  //                 createHttpError(400, "Validation failed", {
  //                     errors: errorMessage,
  //                 })
  //             );
  //         }

  //         if (await checkStockAlreadyExists(validatedData.name)) {
  //             return next(createHttpError(409, "Stock already existed"));
  //         }

  //         const sku = generateStockId();

  //         await StockModel.create({
  //             sku: sku,
  //             name: validatedData.name,
  //             category: validatedData.category,
  //             parentProduct: validatedData.parentProduct,
  //             isVariant: true,
  //             variantAttributes: {
  //                 unit: validatedData.unit,
  //                 sizeOrWeight: validatedData.sizeOrWeight,
  //                 capacity: validatedData.capacity,
  //             },
  //             quantity: validatedData.quantity,
  //             price: validatedData.price,
  //         });

  //         return res.status(201).json({
  //             success: true,
  //             message: "Stock created successfully",
  //         });
  //     } catch (error) {
  //         console.error("error in getting single stock:", error);
  //         next(createHttpError(500, "Internal Server Error"));
  //     }
  // },

  updateStock: async (req, res, next) => {
    try {
      const { sku } = req.params;

      // const { error, value: validatedData } =
      //   VariantUpdateValidationSchema.validate(
      //     req.body,
      //     { stripUnknown: true } // Remove Unknown Fields
      //   );

      // if (error) {
      //   // Create a detailed error message
      //   const errorMessage = error.details.map((detail) => ({
      //     field: detail.path.join("."),
      //     message: detail.message,
      //     type: detail.type,
      //   }));

      //   console.log("Error update stock validation:", errorMessage);

      //   // Send HTTP 400 error with validation details
      //   return next(
      //     createHttpError(400, "Validation failed", {
      //       errors: errorMessage,
      //     })
      //   );
      // }

      const validatedData = req.body;

      await StockModel.findOneAndUpdate(
        { sku },
        {
          status: validatedData.variantStatus,
          name: validatedData.variantName,
          category: validatedData.category,
          guestCapacity: validatedData.guestCapacity,
          quantity: validatedData.quantity,
          attributes: {
            weightUnit: validatedData.weightUnit,
            sizeUnit: validatedData.sizeUnit,
            capacityUnit: validatedData.capacityUnit,
            weight: validatedData.weight,
            size: validatedData.size,
            capacity: validatedData.capacity,
          },
        }
      );

      res.status(204).send();
    } catch (error) {
      console.error("error in update single stock:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  deleteSingleStock: async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { sku } = req.params;

      const stock = await StockModel.findOne({ sku });

      // First delete it's variant stocks if any
      await StockModel.deleteMany(
        { parentStockObjectId: stock._id },
        { session }
      );

      const deletedStock = await StockModel.deleteOne(
        {
          sku,
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      if (deletedStock.deletedCount === 0) {
        return res.status(404).send();
      }

      res.status(204).send();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("error in delete single stock:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
};

export default StockController;
