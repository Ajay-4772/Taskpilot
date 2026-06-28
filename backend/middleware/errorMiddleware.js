const errorMiddleware = (err, req, res, next) => {
  console.error("Server API Error Stack:", err.stack || err.message || err);
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Format validation and cast errors as 400 Bad Requests
  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
  }
  
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = errorMiddleware;
