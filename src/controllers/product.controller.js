import { ProductSchema } from "../Validators/product.js";
import ProductModel from "../models/product.model.js";
import createHttpError from "http-errors";
import generateProductID from "../utils/generateProductID.js";
import slugify from "slugify";
import generateVariantID from "../utils/generateVariantID.js";
import StockModel from "../models/stock.model.js";
import { multipleFileUploadS3 } from "../utils/uploadFileS3.js";
import { deleteFileS3, deleteMultipleFilesS3 } from "../utils/deleteFileS3.js";
import { Category, ProductType } from "../utils/modelConstants.js";
import { processedVariantObject } from "../services/product.service.js";

const ProductController = {
  getProductMetrics: async (req, res, next) => {
    try {
      const totalProducts = await ProductModel.countDocuments({});
      const totalProductActive = await ProductModel.countDocuments({
        status: "active",
      });
      const totalProductInactive = await ProductModel.countDocuments({
        status: "inactive",
      });
      const categories = Object.keys(Category).length;

      res.status(200).json({
        success: true,
        totalProducts: totalProducts,
        totalProductActive: totalProductActive,
        totalProductInactive: totalProductInactive,
        categories: categories,
      });
    } catch (error) {
      console.error("GET: admin getting products analytics:", error);
      next(
        createHttpError(500, {
          errorAPI: "GET: admin getting products analytics",
          message: error.message,
        })
      );
    }
  },

  getProducts: async (req, res, next) => {
    try {
      const { page = 1, searchTerm, limit = 10 } = req.query;

      // Build the filter object
      const filter = {};

      // Text search across name and tags
      if (searchTerm) {
        filter.$or = [
          { name: { $regex: searchTerm, $options: "i" } },
          { tags: { $regex: searchTerm, $options: "i" } },
        ];
      }

      const products = await ProductModel.find(filter)
        .select(
          `name slug mainImage productId category mainImage status productType`
        )
        .skip((page - 1) * limit)
        .limit(limit);

      const totalRows = await ProductModel.countDocuments(filter);
      const categories = Category;

      res.status(200).json({
        success: true,
        products: products,
        totalRows: totalRows,
        categories: categories,
      });
    } catch (error) {
      console.error("GET: admin getting products:", error);
      next(
        createHttpError(500, {
          errorAPI: "GET: admin getting products",
          message: error.message,
        })
      );
    }
  },

  getSingleProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;

      const product = await ProductModel.findOne({ productId })
        .select(
          `-_id productId slug name description category originalPrice 
          discount discountPrice mainImage images tags status
          variants.variantId variants.variantName variants.price variants.status`
        )
        .populate({
          path: "stock",
          select: "-_id status sku quantity attributes variantAttributes",
        })
        .populate({
          path: "variants.stock",
          select: "-_id status sku quantity attributes variantAttributes",
        });

      res.status(200).json({
        success: true,
        product: product,
      });
    } catch (error) {
      console.error("GET: admin getting single product:", error);
      next(
        createHttpError(500, {
          errorAPI: "GET: admin getting single product",
          message: error.message,
        })
      );
    }
  },

  getProductForEdit: async (req, res, next) => {
    try {
      const { productId } = req.params;

      const product = await ProductModel.findOne({ productId })
        .select(
          `_id name description category originalPrice discount discountPrice 
        images tags status productType variants.stock variants.variantId variantName 
        variants.originalPrice variants.discount variants.discountPrice
        variants.status`
        )
        .populate({
          path: "variants.stock",
          select: "sku name",
        });

      res.status(200).json({
        success: true,
        product: product,
      });
    } catch (error) {
      console.error("GET: admin getting product for edit:", error);
      next(
        createHttpError(500, {
          errorAPI: "GET: admin getting product for edit",
          message: error.message,
        })
      );
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
      console.error("GET: admin getting product option:", error);
      next(
        createHttpError(500, {
          errorAPI: "GET: admin getting product option",
          message: error.message,
        })
      );
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
        category,
        productType,
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
      const { error, value: validData } = ProductSchema.validate(
        {
          stock,
          sku,
          name,
          description,
          tags: JSON.parse(tags),
          variants: JSON.parse(variants),
          status,
          category,
          productType,
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

      // Structure variant according to variant model of product
      const processedVariant = await processedVariantObject(validData);

      await ProductModel.create({
        productId: productId,
        slug: slug,
        stock: validData.stock,
        name: validData.name,
        description: validData.description,
        category: validData.category,
        tags: validData.tags,
        mainImage: productImageURLs[0],
        images: productImageURLs,
        variants: processedVariant,
        productType: validData.productType,
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

  // createProduct: async (req, res, next) => {
  //   try {
  //     const {
  //       name,
  //       description,
  //       categoryId, // Object ID
  //       attributes, // JSON format
  //       tags, // JSON format
  //     } = req.body;

  //     console.log("req.boyd:", req.body);

  //     /** Checking slug of product already exist or not */
  //     const slug = slugify(name, { lower: true, strict: true });
  //     const isSlugAlreadyExists = await ProductModel.findOne({ slug });
  //     if (isSlugAlreadyExists) {
  //       return next(
  //         createHttpError(
  //           409,
  //           "Choose different product name. It's already exits!"
  //         )
  //       );
  //     }

  //     // Body validation checking
  //     const { error, value: validatedData } = ProductSchema.validate(
  //       {
  //         name: name,
  //         description: description,
  //         categoryId: categoryId,
  //         attributes: JSON.parse(attributes),
  //         tags: JSON.parse(tags),
  //       },
  //       { stripUnknown: true } // Remove Unknown Fields
  //     );
  //     if (error) {
  //       const errorMessage = error.details.map((detail) => ({
  //         field: detail.path.join("."),
  //         message: detail.message,
  //         type: detail.type,
  //       }));
  //       return next(
  //         createHttpError(400, "Validation failed", {
  //           errors: errorMessage,
  //         })
  //       );
  //     }

  //     console.log("validatedData:", validatedData);

  //     /**
  //      * Store product image in S3 and
  //      * Retreive URL image and store in db
  //      */
  //     const productImageFiles = req.files;
  //     let productImageURLs = [];
  //     try {
  //       productImageURLs = await multipleFileUploadS3({
  //         filePath: "UI/product-image",
  //         files: productImageFiles,
  //       });
  //     } catch (error) {
  //       next(createHttpError(400, "Failed to upload file"));
  //     }

  //     // Generate sku
  //     // const category = await CategoryModel.findById(validatedData.categoryId);
  //     const category = await CategoryModel.find({});
  //     console.log(category);
  //     const sku = generateSKU(category.name);

  //     await ProductModel.create({
  //       sku: sku,
  //       slug: slug,
  //       name: validatedData.name,
  //       description: validatedData.description,
  //       categoryId: validatedData.categoryId,
  //       tags: validatedData.tags,
  //       attributes: {
  //         material: validatedData.attributes.material,
  //         brand: validatedData.attributes.brand,
  //       },
  //       images: productImageURLs,
  //     });

  //     res.status(201).json({
  //       success: true,
  //       message: "New Product Created",
  //     });
  //   } catch (error) {
  //     console.error("error in create product:", error);
  //     next(createHttpError(500, "Internal Server Error"));
  //   }
  // },

  // createProductVariant: async (req, res, next) => {},

  // updateProduct: async (req, res, next) => {},

  updateProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const formData = req.body;

      console.log("hell:", formData);

      // checking product name is already taken or not
      let updateSlug = null;
      if (formData.name) {
        const slug = slugify(formData.name, { lower: true, strict: true });
        const slugAlreadyExists = await ProductModel.findOne({ slug });
        if (slugAlreadyExists) {
          return next(
            createHttpError(409, {
              errorAPI: "PATCH: admin update product",
              message: "Product name already taken!",
            })
          );
        } else {
          updateSlug = slug;
        }
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
        next(
          createHttpError(400, {
            errorAPI: "PATCH: admin update product",
            message: "Failed to upload file",
          })
        );
      }

      const product = await ProductModel.findOne({ productId });

      /**
       * Using loop for update product properties value
       * 3 different cases: variants, tags, and other non-nested properties
       */
      for (const key in formData) {
        if (key === "variants") {
          const variants = JSON.parse(formData["variants"]);
          variants.forEach((variant) => {
            product.variants.forEach((v) => {
              if (v.stock.toString() === variant.stock) {
                v.originalPrice = variant.originalPrice;
                v.discount = variant.discount;
                v.discountPrice = variant.discountPrice;

                if (product.productType === ProductType.rental) {
                  v.price.rental.price = variant.originalPrice;
                  v.price.rental.discount = variant.discount;
                  v.price.rental.discountPrice = variant.discountPrice;
                } else if (product.productType === ProductType.sale) {
                  v.price.sale.price = variant.originalPrice;
                  v.price.sale.discount = variant.discount;
                  v.price.sale.discountPrice = variant.discountPrice;
                }
              }
            });
          });
        } else if (key === "tags") {
          product[key] = JSON.parse(formData[key]);
        } else {
          product[key] = formData[key];
        }
      }

      if (productImageURLs.length > 0) {
        product.images.push(...productImageURLs);
        if (!product.mainImage) {
          product.mainImage = product.images[0];
        }
      }

      if (updateSlug) {
        product.slug = updateSlug;
      }

      await product.save();

      res.status(201).json({
        success: true,
        message: "Successfully product updated!",
      });
    } catch (error) {
      console.error("PATCH: admin update product", error);
      next(
        createHttpError(500, {
          errorAPI: "PATCH: admin update product",
          message: error.message,
        })
      );
    }
  },

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
      console.error("GET: admin delete product:", error);
      next(
        createHttpError(500, {
          errorAPI: "GET: admin getting delete product",
          message: error.message,
        })
      );
    }
  },

  deleteSingleImageFromProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { imageURL } = req.query;

      console.log("product id:", productId);
      console.log("image URL:", imageURL);

      const deletedImage = await deleteFileS3(imageURL);
      console.log("images deleted:", deletedImage);
      if (deletedImage.success) {
        const product = await ProductModel.findOne({ productId });
        if (product.mainImage === imageURL) {
          product.mainImage = null;
          if (product.images.length > 0) {
            product.mainImage = product.images[0];
          }
        }
        const filterImages = product.images.filter((img) => img !== imageURL);
        product.images = filterImages;

        await product.save();
      }

      res.status(200).json({
        success: true,
        message: `Successfully delete image: ${imageURL}`,
      });
    } catch (error) {
      console.error("DELETE: admin delete single image products:", error);
      next(
        createHttpError(500, {
          errorAPI: "DELETE: admin delete single image products",
          message: "Error in delete product image",
          debugMessage: error.message,
        })
      );
    }
  },
};

export default ProductController;
