export const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error?.name === "MulterError") {
    return res.status(400).json({ message: "Upload failed: file is too large or invalid." });
  }

  if (error?.name === "PrismaClientKnownRequestError" && error?.code === "P2025") {
    return res.status(404).json({ message: "Requested resource not found." });
  }

  const status = error.status || error.statusCode || 500;
  return res.status(status).json({
    message: error.message || "Something went wrong. Please try again later.",
  });
};
