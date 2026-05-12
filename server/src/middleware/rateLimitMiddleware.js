import rateLimit from "express-rate-limit";

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

export const authRateLimiter = createLimiter(
  15 * 60 * 1000,
  20,
  "Too many authentication requests. Please try again later."
);

export const uploadRateLimiter = createLimiter(
  10 * 60 * 1000,
  30,
  "Too many upload requests. Please try again later."
);

export const listingWriteRateLimiter = createLimiter(
  10 * 60 * 1000,
  120,
  "Too many listing requests. Please try again later."
);

export const reportRateLimiter = createLimiter(
  10 * 60 * 1000,
  20,
  "Too many report submissions. Please try again later."
);

export const adminActionRateLimiter = createLimiter(
  10 * 60 * 1000,
  180,
  "Too many admin actions. Please try again later."
);
