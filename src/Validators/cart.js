import Joi from "joi";

export const UpdateCartResponseBodySchema = Joi.object({
  itemType: Joi.string().valid("product", "package"),
  itemId: Joi.string().optional(),
  variantId: Joi.string().optional(),
  quantity: Joi.number().min(1),
  action: Joi.string().valid("increment", "decrement"),
});

export const AddCartResponseBodySchema = Joi.object({
  itemType: Joi.string().valid("product", "package"),
  itemId: Joi.string().optional(),
  variantId: Joi.string().optional(),
  quantity: Joi.number().min(1),
});
