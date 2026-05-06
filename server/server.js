import "dotenv/config";
import app from "./src/app.js";
import { captureException, initSentry } from "./src/config/sentry.js";

const PORT = process.env.PORT || 5000;

initSentry();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  captureException(reason instanceof Error ? reason : new Error(String(reason)), { type: "unhandledRejection" });
});

process.on("uncaughtException", (error) => {
  captureException(error, { type: "uncaughtException" });
});
