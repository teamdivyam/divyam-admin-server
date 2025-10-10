import slugify from "slugify";
import CategoryModel from "../models/category.model.js";
import createHttpError from "http-errors";

const CategoryController = {
  getCategory: async (req, res, next) => {
    const category = await CategoryModel.find({});

    res.status(200).json({
      success: true,
      category: category,
    });
    try {
    } catch (error) {
      console.error("error getting category:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  createCategory: async (req, res, next) => {
    try {
      const { name, parentId } = req.body;

      /** Checking slug of product already exist or not */
      const slug = slugify(name, { lower: true, strict: true });
      const isSlugAlreadyExists = await CategoryModel.findOne({ slug });
      if (isSlugAlreadyExists) {
        return next(
          createHttpError(
            409,
            "Choose different category name. It's already exits!"
          )
        );
      }

      await CategoryModel.create({
        name: name,
        slug: slug,
        parentId: parentId,
      });

      res.status(200).json({
        success: true,
        message: "Category created",
      });
    } catch (error) {
      console.error("error create category:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },

  updateCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const { name } = req.body;

      /** Checking slug of product already exist or not */
      const slug = slugify(name, { lower: true, strict: true });
      const isSlugAlreadyExists = await CategoryModel.findOne({ slug });
      if (isSlugAlreadyExists) {
        return next(
          createHttpError(
            409,
            "Choose different category name. It's already exits!"
          )
        );
      }

      // continue from here tomorrow
    } catch (error) {
      console.error("error update category:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
    } catch (error) {
      console.error("error delete category:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
};

export default CategoryController;
