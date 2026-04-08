import rateLimit from "express-rate-limit";

 export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // only 5 attempts
  message: "Too many login attempts. Try again later.",
});