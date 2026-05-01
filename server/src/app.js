import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CRICKIFY API RUNNING");
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
