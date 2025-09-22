import createHttpError from "http-errors";
import PackageModel from "../models/package.model.js";
import { PackageSchema } from "../Validators/package.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3ClientConfig } from "../config/aws.js";
import { generatePackageID } from "../utils/generateID.js";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

const PackageController = {
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

      console.log("reqbody:", req.body);

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
      console.log("reqfiles:", req.files);

      const packageMainImage = req.files.packageMainImage?.[0]; // single file
      const packageFiles = req.files.packageBannerImage || []; // multiple files

      let packageMainImageURL;
      if (!packageMainImage) {
        return next(createHttpError(400, "Banner image is required"));
      } else {
        const bannerImageKey = `UI/package-main-image/${uuidv4()}-${
          packageMainImage.originalname
        }`;
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: bannerImageKey,
          Body: packageMainImage.buffer,
          ContentType: packageMainImage.mimetype,
        };
        const command = new PutObjectCommand(params);
        await S3ClientConfig.send(command);

        packageMainImageURL = `https://assets.divyam.com/${bannerImageKey}`;
      }
      
      let packageBannerImageURLs = [];
      if (packageFiles) {
        const uploadFilePromises = packageFiles.map(async (file) => {
          const key = `UI/package-banner-image/${uuidv4()}-${file.originalname}`;
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          const command = new PutObjectCommand(params);
          await S3ClientConfig.send(command);

          return `https://assets.divyam.com/${key}`;
        });

        const imageURLs = await Promise.all(uploadFilePromises);
        packageBannerImageURLs.push(...imageURLs);
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
};

export default PackageController;
