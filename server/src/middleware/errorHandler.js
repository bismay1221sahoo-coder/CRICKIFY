export const errorHandler = (error, req, res, next) => {
  console.error(error);

  const status = error.status || error.statusCode || 500;
  return res.status(status).json({
    message: error.message || "Something went wrong. Please try again later.",
  });
};
