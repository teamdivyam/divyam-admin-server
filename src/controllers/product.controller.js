import { ProductSchema } from "../Validators/product.js";
import ProductModel from "../models/product.model.js";
import createHttpError from "http-errors";
import generateProductID from "../utils/generateProductID.js";
import slugify from "slugify";
import generateVariantID from "../utils/generateVariantID.js";
import StockModel from "../models/stock.model.js";
import { multipleFileUploadS3 } from "../utils/uploadFileS3.js";
import { deleteFileS3, deleteMultipleFilesS3 } from "../utils/deleteFileS3.js";

const ProductController = {
  getProducts: async (req, res, next) => {
    try {
      const products = await ProductModel.find({});

      res.status(200).json({
        success: true,
        products: products,
      });
    } catch (error) {
      console.error("error in get product:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  getProductOption: async (req, res, next) => {
    try {
      const productOption = await ProductModel.find({})
        .select("_id productId name variants.variantName variants.variantId")
        .populate({ path: "stock", select: "quantity" })
        .populate({ path: "variants.stock", select: "-_id quantity" });

      res.status(200).json({
        success: true,
        productOption: productOption,
      });
    } catch (error) {
      console.error("error in get product:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  createProduct: async (req, res, next) => {
    try {
      const {
        stock,
        sku,
        name,
        description,
        tags,
        variants,
        status,
        discount,
        discountPrice,
        originalPrice,
        category,
      } = req.body;

      // Check slug name is unique and already exist or not
      const slug = slugify(name, { lower: true, strict: true });
      const slugAlreadyExists = await ProductModel.findOne({ slug });
      if (slugAlreadyExists) {
        return next(
          createHttpError(
            409,
            "Choose different product name. It's already exits!"
          )
        );
      }

      // Validation Checking
      const { error, value: validatedData } = ProductSchema.validate(
        {
          stock,
          sku,
          name,
          description,
          tags: JSON.parse(tags),
          variants: JSON.parse(variants),
          status,
          discount,
          discountPrice,
          originalPrice,
          category,
        },
        { stripUnknown: true } // Remove Unknown Fields
      );
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

      // Store product images in S3
      const productImageFiles = req.files;
      let productImageURLs = [];
      try {
        productImageURLs = await multipleFileUploadS3({
          filePath: "UI/product-image",
          files: productImageFiles,
        });
      } catch (error) {
        next(createHttpError(400, "Failed to upload file"));
      }

      // Generate product id
      const productId = generateProductID();

      // Generate variant id and store variant name
      for (let i = 0; i < validatedData.variants.length; i++) {
        const stock = await StockModel.findById(
          validatedData.variants[i].stock
        );
        validatedData.variants[i].variantId = generateVariantID();
        validatedData.variants[i].variantName = stock.name;
      }

      await ProductModel.create({
        productId: productId,
        slug: slug,
        stock: validatedData.stock,
        name: validatedData.name,
        description: validatedData.description,
        discount: validatedData.discount || validatedData.variants[0]?.discount,
        discountPrice:
          Number(validatedData.discountPrice.toFixed(2)) ||
          Number(validatedData.variants[0]?.discountPrice.toFixed(2)),
        originalPrice:
          validatedData.originalPrice ||
          validatedData.variants[0]?.originalPrice,
        category: validatedData.category,
        tags: validatedData.tags,
        mainImage: productImageURLs[0],
        images: productImageURLs,
        variants: validatedData.variants,
      });

      res.status(201).json({
        success: true,
        message: "New Product Created",
      });
    } catch (error) {
      console.error("error in create product:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
  updateProduct: async (req, res, next) => {},

  deleteProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const product = await ProductModel.findOne({ productId });

      // Delete images in package in S3
      await deleteFileS3(product.mainImage);
      await deleteMultipleFilesS3(product.images);

      const deletedProduct = await ProductModel.deleteOne({ productId });

      if (deletedProduct.deletedCount === 0) {
        return res.status(404).send();
      }

      res.status(204).send("Product deleted");
    } catch (error) {
      console.error("error in delete product:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
};

export default ProductController;
