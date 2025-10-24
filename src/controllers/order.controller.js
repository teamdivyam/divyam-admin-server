const OrderController = {
  getUserOrders: async (req, res, next) => {
    try {
      res.status(200).json({});
    } catch (error) {
      console.error("GET: user orders:", error);
      next(
        createHttpError(500, {
          errorAPI: "GET: user orders:",
          message: error.message,
        })
      );
    }
  },
  createUserOrder: async (req, res, next) => {
    try {
      res.status(200).json({});
    } catch (error) {
      console.error("POST: create user order:", error);
      next(
        createHttpError(500, {
          errorAPI: "POST: create user order",
          message: error.message,
        })
      );
    }
  },
};

export default OrderController;
