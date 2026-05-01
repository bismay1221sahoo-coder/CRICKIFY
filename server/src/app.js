import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CRICKIFY API RUNNING");
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(errorHandler);

export default app;
