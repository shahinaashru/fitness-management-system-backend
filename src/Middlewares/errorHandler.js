function errorHandler(err, req, res, next) {
  console.error(err);

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err.name === "ValidationError") {
    const firstError = Object.values(err.errors)[0].message;
    statusCode = 400;
    message = firstError;
  }

  if (err.code && err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
  }

  if (err.isJoi) {
    statusCode = 400;
    message = err.details[0].message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: err.message || message,
  });
}

module.exports = errorHandler;
