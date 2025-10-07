import ReservedStockModel from "../models/reservedStock.model.js";
import StockModel from "../models/stock.model.js";

export const checkStockAvailability = async (
  sku,
  desiredQty,
  fromDate,
  toDate
) => {
  // Find all overlapping reservations for this stock
  const reserved = await ReservedStockModel.aggregate([
    {
      $match: {
        sku: sku,
        $or: [{ fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }],
      },
    },
    {
      $group: {
        _id: "$sku",
        totalReserved: { $sum: "$quantity" },
      },
    },
  ]);

  const totalReserved = reserved.length ? reserved[0].totalReserved : 0;

  // Fetch total available stock from your main stock collection if needed
  const stock = await StockModel.findOne({ sku });

  const available = stock.totalQuantity - totalReserved;

  return {
    available: available >= desiredQty,
    availableQty: available,
  };
};

export const checkMultipleStocks = async (stocks, fromDate, toDate) => {
  const stockSKUs = stocks.map((s) => s.sku);

  // Aggregate overlapping reservations for all stocks in one go
  const reservations = await ReservedStockModel.aggregate([
    {
      $match: {
        sku: { $in: stockSKUs },
        fromDate: { $lte: toDate },
        toDate: { $gte: fromDate },
      },
    },
    {
      $group: {
        _id: "$sku",
        totalReserved: { $sum: "$quantity" },
      },
    },
  ]);

  // Fetch stock details if needed
  const stocksData = await StockModel.find({ sku: { $in: stockSKUs } }).lean();

  // Merge data
  return stocks.map((s) => {
    const reserved = reservations.find((r) => r.sku === s.sku);
    const stock = stocksData.find((stk) => stk.sku === s.sku);

    const totalReserved = reserved ? reserved.totalReserved : 0;
    const availableQty = stock.quantity - totalReserved;
    return {
      sku: s.sku,
      available: availableQty >= s.desiredQty,
      availableQty,
    };
  });
};
