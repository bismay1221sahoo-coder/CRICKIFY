import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  authRateLimiter,
  listingWriteRateLimiter,
  uploadRateLimiter,
} from "./middleware/rateLimitMiddleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("CRICKIFY API RUNNING");
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/listings", listingWriteRateLimiter, listingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRateLimiter, uploadRoutes);

app.use(errorHandler);

export default app;
