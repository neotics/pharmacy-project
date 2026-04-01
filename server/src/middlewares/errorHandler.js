import ApiError from "../utils/ApiError.js";

export const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found."));
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error?.name === "ValidationError") {
    res.status(400).json({
      message: "Validation failed.",
      details: Object.values(error.errors).map((item) => item.message),
    });
    return;
  }

  if (error?.code === 11000) {
    res.status(409).json({
      message: "A record with this value already exists.",
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: "Internal server error.",
  });
};

