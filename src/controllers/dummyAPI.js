const dummyAPI = async (req, res, next) => {
  try {
    res.status(200).json({});
  } catch (error) {
    console.error("GET: admin dummy:", error);
    next(
      createHttpError(500, {
        errorAPI: "GET: admin dummy",
        message: error.message,
      })
    );
  }
};
