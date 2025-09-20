import Joi from "joi";

export const PackageSchema = Joi.object({
  packageName: Joi.string().trim().required().messages({
    "string.base": "Package name must be a string",
    "string.empty": "Package name is required",
    "any.required": "Package name is required",
  }),

  products: Joi.array()
    .items(
      Joi.object({
        productObjectId: Joi.string().required().messages({
          "string.base": "Product ID must be a string",
          "any.required": "Product ID is required",
        }),
        variantId: Joi.string().allow(null, "").messages({
          "string.base": "Variant ID must be a string",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Quantity must be a number",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Products must be an array",
      "array.min": "At least one product is required",
      "any.required": "Products are required",
    }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),

  tags: Joi.array().items(Joi.string().trim()).messages({
    "array.base": "Tags must be an array of strings",
  }),

  discountPrice: Joi.number().min(0).messages({
    "number.base": "Discount price must be a number",
    "number.min": "Discount price cannot be negative",
  }),

  originalPrice: Joi.number().min(0).required().messages({
    "number.base": "Original price must be a number",
    "number.min": "Original price cannot be negative",
    "any.required": "Original price is required",
  }),

  discountPercent: Joi.number().min(0).max(100).messages({
    "number.base": "Discount percent must be a number",
    "number.min": "Discount percent cannot be negative",
    "number.max": "Discount percent cannot exceed 100",
  }),

  tierObjectId: Joi.string().required().messages({
    "string.base": "Tier ID must be a string",
    "any.required": "Tier ID is required",
  }),

  capacity: Joi.number().min(0).required().messages({
    "number.base": "Capacity must be a number",
    "number.min": "Capacity cannot be negative",
    "any.required": "Capacity is required",
  }),

  isVisible: Joi.boolean().default(true).messages({
    "boolean.base": "isVisible must be true or false",
  }),
});
