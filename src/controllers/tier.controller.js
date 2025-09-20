import createHttpError from "http-errors";
import TierModel from "../models/tier.model.js";

const TierController = {
  getTier: async (req, res, next) => {
    try {
      const tier = await TierModel.find({});

      res.status(201).json({
        tier: tier,
      });
    } catch (error) {
      console.error("error in create tier:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
  createTier: async (req, res, next) => {
    try {
      const { tierName } = req.body;

      if (!tierName) {
        return next(
          createHttpError(409, "Validation failed", {
            validationError: "Tier name is required",
          })
        );
      }
      await TierModel.create({ tierName: tierName });

      res.status(201).json({
        message: "Tier created successfully",
      });
    } catch (error) {
      console.error("error in create tier:", error);
      next(createHttpError(500, "Internal Server Error"));
    }
  },
};

export default TierController;
