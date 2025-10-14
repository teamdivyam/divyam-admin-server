import mongoose from "mongoose";
import StockModel from "../../models/stock.model.js";
import generateStockId from "../../utils/generateStockID.js";

mongoose
  .connect("mongodb://localhost:27017/divyam-server-db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const stockData = [
  {
    isVariantParentAlreadyExists: false,
    parent: {
      name: "Bhagona",
      category: "cooking",
    },
    variants: [
      {
        name: "Bhagona 28' 4MM",
        category: "cooking",
        isVariant: true,
        attributes: {
          weightUnit: "kg",
          weight: "32",
          sizeUnit: "inch",
          size: "28",
          capacityUnit: "ltr",
          capacity: "160",
        },
        guestCapacity: 1000,
        quantity: 5,
      },
      {
        name: "Bhagona 26' 4MM",
        category: "cooking",
        isVariant: true,
        attributes: {
          weightUnit: "kg",
          weight: "28",
          sizeUnit: "inch",
          size: "26",
          capacityUnit: "ltr",
          capacity: "128",
        },
        guestCapacity: 700,
        quantity: 5,
      },
    ],
  },
  {
    isVariantParentAlreadyExists: false,
    parent: {
      name: "Burner",
      category: "cooking",
    },
    variants: [
      {
        name: "Chapati Burner",
        category: "cooking",
        isVariant: true,
        quantity: 10,
      },
      {
        name: "Dosa Burner",
        category: "cooking",
        isVariant: true,
        quantity: 10,
      },
    ],
  },
];

const seedStockData = async () => {
  try {
    stockData.forEach(async (stock, indexParentLevel) => {
      if (stock.isVariantParentAlreadyExists) {
      } else {
        const skuParentStock = generateStockId(stock.parent.category);

        const parentStock = await StockModel.create({
          sku: skuParentStock,
          name: stock.parent.name,
          category: stock.parent.category,
        });

        stock.variants.forEach(async (variant, indexVariantLevel) => {
          const skuVarientStock = generateStockId(variant.category);

          await StockModel.create({
            parentStockId: parentStock._id,
            sku: skuVarientStock,
            name: variant.name,
            category: variant.category,
            isVariant: true,
            attributes: {
              weightUnit: variant.attributes?.weightUnit,
              sizeUnit: variant.attributes?.sizeUnit,
              capacityUnit: variant.attributes?.capacityUnit,
              weight: variant.attributes?.weight,
              size: variant.attributes?.size,
              capacity: variant.attributes?.capacity,
            },
            guestCapacity: variant.guestCapacity,
            remarks: variant.remarks,
            quantity: variant.quantity,
          });
        });

        console.log("Seeding done successfully!");
      }
    });
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};

seedStockData();
