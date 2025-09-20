import Joi from "joi";

export const AddNewStockSchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(100).messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),

  category: Joi.string()
    .required()
    .valid("COOKING", "DINING", "SERVING", "DECORATIVE", "OTHERS")
    .messages({
      "string.empty": "Category is required",
      "any.only": "Please select a valid category",
      "any.required": "Category is required",
    }),

  quantity: Joi.number().required().min(0).integer().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity cannot be negative",
    "number.integer": "Quantity must be a whole number",
    "any.required": "Quantity is required",
  }),

  capacity: Joi.number()
    .allow(null)
    .min(0)
    .custom((value, helpers) => {
      if (value === null || value === undefined) return value;
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        return helpers.error("number.decimal");
      }
      return value;
    })
    .messages({
      "number.base": "Capacity must be a number",
      "number.min": "Capacity cannot be negative",
      "number.decimal": "Capacity can have up to 2 decimal places",
    }),

  unit: Joi.string()
    .allow(null, "")
    .max(20)
    .custom((value, helpers) => {
      if (!value || value === "") return null;
      const allowedUnits = ["lt", "kg", "inch", "cm"];
      if (!allowedUnits.includes(value.toLowerCase())) {
        return helpers.error("string.unit");
      }
      return value;
    })
    .messages({
      "string.max": "Unit cannot exceed 20 characters",
      "string.unit": "Unit must be one of: lt, kg, inch, cm, or empty",
    }),

  sizeOrWeight: Joi.string().allow(null, "").max(50).messages({
    "string.max": "Size/Weight cannot exceed 50 characters",
  }),
});

export const AddNewStockVariantSchema = Joi.object({
  parentStockId: Joi.string().allow(null, "").messages({
    "string.base": "Parent stock ID must be a string",
  }),

  parentStockName: Joi.string().allow(null, "").max(100).messages({
    "string.max": "Parent stock name cannot exceed 100 characters",
  }),

  parentStockCategory: Joi.string().allow(null, "").max(50).messages({
    "string.max": "Parent stock category cannot exceed 50 characters",
  }),

  variantStockName: Joi.string().trim().required().min(2).max(100).messages({
    "string.empty": "Variant name is required",
    "string.min": "Variant name must be at least 2 characters",
    "string.max": "Variant name cannot exceed 100 characters",
    "any.required": "Variant name is required",
  }),

  variantStockCategory: Joi.string()
    .required()
    .valid("COOKING", "DINING", "SERVING", "DECORATIVE", "OTHERS")
    .messages({
      "string.empty": "Variant category is required",
      "any.only": "Please select a valid category",
      "any.required": "Variant category is required",
    }),

  variantStockQuantity: Joi.number().required().min(0).integer().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity cannot be negative",
    "number.integer": "Quantity must be a whole number",
    "any.required": "Quantity is required",
  }),

  variantStockUnit: Joi.string()
    .allow(null, "")
    .max(20)
    .custom((value, helpers) => {
      if (!value || value === "") return null;
      const allowedUnits = ["lt", "kg", "inch", "cm"];
      if (!allowedUnits.includes(value.toLowerCase())) {
        return helpers.error("string.unit");
      }
      return value;
    })
    .messages({
      "string.max": "Unit cannot exceed 20 characters",
      "string.unit": "Unit must be one of: lt, kg, inch, cm, or empty",
    }),

  variantSizeOrWeight: Joi.string().allow(null, "").max(50).messages({
    "string.max": "Size/Weight cannot exceed 50 characters",
  }),

  variantStockCapacity: Joi.number()
    .allow(null)
    .min(0)
    .custom((value, helpers) => {
      if (value === null || value === undefined) return value;
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        return helpers.error("number.decimal");
      }
      return value;
    })
    .messages({
      "number.base": "Capacity must be a number",
      "number.min": "Capacity cannot be negative",
      "number.decimal": "Capacity can have up to 2 decimal places",
    }),
})
  .custom((value, helpers) => {
    console.log("working...");
    const { parentStockId, parentStockName, parentStockCategory } = value;

    const isIdEmpty = !parentStockId || parentStockId.trim() === "";
    const isNameEmpty = !parentStockName || parentStockName.trim() === "";
    const isCategoryEmpty =
      !parentStockCategory || parentStockCategory.trim() === "";

    // ❌ Case 0: all empty
    if (isIdEmpty && isNameEmpty && isCategoryEmpty) {
      return helpers.error("custom.requiredOne", {
        message:
          "You must either select a parent stock OR provide both name & category",
      });
    }

    // ❌ Case 1: ID + (name/category) together
    if (!isIdEmpty && (!isNameEmpty || !isCategoryEmpty)) {
      return helpers.error("custom.mutualExclusion", {
        message: "Clear parent stock name & category if using parent stock ID",
      });
    }

    // ❌ Case 2: Missing one of name/category
    if (isIdEmpty && (isNameEmpty || isCategoryEmpty)) {
      return helpers.error("custom.parentStock", {
        message:
          "Provide both parent stock name and category if no parent stock ID is selected",
      });
    }

    return value;
  })
  .messages({
    "custom.requiredOne": "{{#message}}",
    "custom.parentStock": "{{#message}}",
    "custom.mutualExclusion": "{{#message}}",
  });
