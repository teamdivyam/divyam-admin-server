import createHttpError from "http-errors";
import PackageModel from "../models/package.model.js";
import { PackageSchema } from "../Validators/package.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3ClientConfig } from "../config/aws.js";
import { generatePackageID } from "../utils/generateID.js";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { fileUploadS3, multipleFileUploadS3 } from "../utils/uploadFileS3.js";
import { deleteFileS3, deleteMultipleFilesS3 } from "../utils/deleteFileS3.js";

const PackageController = {
  getPackage: async (req, res, next) => {
    try {
      const { page = 1, searchTerm, limit = 10, tierId, isVisible } = req.query;

      // Build the filter object
      const filter = {};

      // Text search across name and tags
      if (searchTerm) {
        filter.$or = [
          { packageName: { $regex: searchTerm, $options: "i" } },
          { tags: { $regex: searchTerm, $options: "i" } },
        ];
      }

      // Tier filter
      if (tierId) {
        filter.tierObjectId = tierId;
      }

      // Visibility filter
      if (isVisible) {
        filter.isVisible = isVisible
      }

      const packages = await PackageModel.find(filter)
        .select(`packageId packageName isVisible capacity discountPrice slug`)
        .skip((page - 1) * limit) 
        .limit(limit)
        // .lean();

      const totalPackages = await PackageModel.countDocuments(filter);

      res.status(200).json({
        success: true,
        packages: packages,
        totalRows: totalPackages,
      });
    } catch (error) {
      console.error("error in get package:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  getSinglePackage: async (req, res, next) => {
    try {
      const { packageId } = req.params;

      const packageData = await PackageModel.findOne({ packageId: packageId })
        .select(
          `packageName mainPackageImage packageBannerImages products description
            tags discountPrice originalPrice discountPercent rating tierObjectId capacity`
        )
        .populate({
          path: "products.productObjectId",
        })
        .populate({
          path: "tierObjectId",
          select: "tierName",
        })
        // .lean();

      res.status(200).json({
        success: true,
        package: packageData,
      });
    } catch (error) {
      console.error("error in get single package:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  getSinglePackageForEdit: async (req, res, next) => {
    try {
      const { packageId } = req.params;

      const packageData = await PackageModel.findOne({ packageId: packageId })
        .select(
          `packageName mainPackageImage packageBannerImages products description
            tags discountPrice originalPrice discountPercent rating tierObjectId capacity isVisible`
        )
        .populate({
          path: "products.productObjectId",
        })
        .populate({
          path: "tierObjectId",
          select: "tierName",
        })
        // .lean();

      res.status(200).json({
        success: true,
        package: packageData,
      });
    } catch (error) {
      console.error("error in get single package:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  createPackage: async (req, res, next) => {
    try {
      const {
        packageName,
        products,
        description,
        tags,
        discountPrice,
        originalPrice,
        discountPercent,
        tierObjectId,
        capacity,
        isVisible,
        policy,
      } = req.body;

      // Validation Checking
      const { error, value: validatedData } = PackageSchema.validate(
        {
          packageName,
          products: JSON.parse(products),
          description,
          tags: JSON.parse(tags),
          discountPrice,
          originalPrice,
          discountPercent,
          tierObjectId,
          capacity,
          isVisible,
          policy,
        },
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

      // Check slug name is unique and already exist or not
      const slug = slugify(packageName, { lower: true, strict: true });
      const slugAlreadyExists = await PackageModel.findOne({ slug });
      if (slugAlreadyExists) {
        return next(
          createHttpError(
            409,
            "Choose different package name. It's already exits!"
          )
        );
      }

      const packageMainImageFile = req.files.packageMainImage?.[0]; // single file
      const packageBannerImageFiles = req.files.packageBannerImage || []; // multiple files

      let packageMainImageURL;
      try {
        if (!packageMainImageFile) {
          throw new Error("Package main image is not provided!");
        }
        packageMainImageURL = await fileUploadS3({
          filePath: "UI/package-main-image",
          file: packageMainImageFile,
        });
      } catch (error) {
        next(createHttpError(400, error.message));
      }

      let packageBannerImageURLs = [];
      try {
        packageBannerImageURLs = await multipleFileUploadS3({
          filePath: "UI/package-banner-image",
          files: packageBannerImageFiles,
        });
      } catch (error) {
        next(createHttpError(400, error.message, { message: error.message }));
      }

      // Generate product id
      const packageId = generatePackageID();

      await PackageModel.create({
        packageId: packageId,
        packageName: validatedData.packageName,
        mainPackageImage: packageMainImageURL,
        packageBannerImages: packageBannerImageURLs,
        products: validatedData.products,
        description: validatedData.description,
        tags: validatedData.tags,
        discountPercent: validatedData.discountPercent,
        originalPrice: Number(validatedData.originalPrice.toFixed(2)),
        discountPrice: Number(validatedData.discountPrice.toFixed(2)),
        tierObjectId: validatedData.tierObjectId,
        capacity: validatedData.capacity,
        isVisible: validatedData.isVisible,
        slug: slug,
        policy: policy,
      });
      
      res.status(201).json({
        success: true,
        message: "New Package Created",
      });
    } catch (error) {
      console.error("error in create package:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  updatePackage: async (req, res, next) => {
    try {
      const {
        packageName,
        products,
        description,
        tags,
        discountPrice,
        originalPrice,
        discountPercent,
        tierObjectId,
        capacity,
        isVisible,
        policy,
      } = req.body;

      const { packageId } = req.params;

      // Check slug name is unique and already exist or not
      if (packageName) {
        const slug = slugify(packageName, { lower: true, strict: true });
        const slugAlreadyExists = await PackageModel.findOne({ slug });
        if (slugAlreadyExists) {
          return next(
            createHttpError(
              409,
              "Choose different package name. It's already exits!"
            )
          );
        }
      }

      const packageMainImageFile = req.files?.packageMainImage?.[0]; // single file
      const packageBannerImageFiles = req.files?.packageBannerImage || []; // multiple files

      let packageMainImageURL = undefined;
      try {
        if (packageMainImageFile) {
          packageMainImageURL = await fileUploadS3({
            filePath: "UI/package-main-image",
            file: packageMainImageFile,
          });
        }
      } catch (error) {
        next(createHttpError(400, error.message));
      }

      let packageBannerImageURLs = [];
      try {
        if (packageBannerImageFiles.length > 0) {
          const packageBannerImageURLFromS3 = await multipleFileUploadS3({
            filePath: "UI/package-banner-image",
            files: packageBannerImageFiles,
          });
          packageBannerImageURLs.push(...packageBannerImageURLFromS3);
        }
      } catch (error) {
        next(createHttpError(400, error.message, { message: error.message }));
      }

      const packageData = await PackageModel.findOne({ packageId });

      console.log("packageData:", packageData);

      if (packageMainImageURL) {
        packageData.mainPackageImage = packageMainImageURL;
      }
      if (packageBannerImageURLs.length > 0) {
        packageData.packageBannerImages.push(...packageBannerImageURLs);
      }
      if (packageName) {
        packageData.packageName = packageName;
        const slug = slugify(packageName, { lower: true, strict: true });
        packageData.slug = slug;
      }
      if (products?.length > 0) {
        const parseProducts = JSON.parse(products);
        packageData.products = parseProducts;
      }
      if (description) {
        packageData.description = description;
      }
      if (tags) {
        const parseTags = JSON.parse(tags);
        if (parseTags.length > 0) {
          packageData.tags = parseTags;
        }
      }
      if (discountPrice) {
        packageData.discountPrice = discountPrice;
      }
      if (originalPrice) {
        packageData.originalPrice = originalPrice;
      }
      if (discountPercent) {
        packageData.discountPercent = discountPercent;
      }
      if (tierObjectId) {
        packageData.tierObjectId = tierObjectId;
      }
      if (capacity) {
        packageData.capacity = capacity;
      }
      if (isVisible) {
        packageData.isVisible = isVisible;
      }
      if (policy) {
        packageData.policy = policy;
      }

      await packageData.save();

      res.status(201).json({
        success: true,
        message: "Package update successfully",
      });
    } catch (error) {
      console.error("error in update package:", error);
      next(
        createHttpError(500, "Internal Server Error", {
          message: error.message,
        })
      );
    }
  },

  deletePackage: async (req, res, next) => {
    try {
      const { packageId } = req.params;
      const packageData = await PackageModel.findOne({ packageId });

      // Delete images in package in S3
      await deleteFileS3(packageData.mainPackageImage);
      await deleteMultipleFilesS3(packageData.packageBannerImages);

      const deletedPackage = await PackageModel.deleteOne({ packageId });

      if (deletedPackage.deletedCount === 0) {
        return res.status(404).send();
      }

      res.status(204).send("Package deleted");
    } catch (error) {
      console.error("error in delete package:", error);
      next(
        createHttpError(500, "Internal Server Error", {
          message: error.message,
        })
      );
    }
  },

  deleteSingleImageFromPackage: async (req, res, next) => {
    try {
      const { packageId } = req.params;
      const { imageType, imageURL } = req.query;

      console.log("packageId", packageId);
      console.log("imageType", imageType);
      console.log("imageURL", imageURL);
      if (imageType === "packageMainImage") {
        const deletedImage = await deleteFileS3(imageURL);
        if (deletedImage.success) {
          await PackageModel.updateOne(
            { packageId },
            { $set: { mainPackageImage: null } }
          );
        }
      }
      if (imageType === "packageBannerImage") {
        const deletedImage = await deleteFileS3(imageURL);
        if (deletedImage.success) {
          console.log("deletedImage:", deletedImage);
          await PackageModel.updateOne(
            { packageId },
            { $pull: { packageBannerImages: imageURL } }
          );
        }
      }

      res.status(204).send("Single Image of Package Deleted!");
    } catch (error) {
      console.error("error in delete single image from package:", error);
      next(
        createHttpError(500, "Internal Server Error", {
          message: error.message,
        })
      );
    }
  },
};

export default PackageController;
