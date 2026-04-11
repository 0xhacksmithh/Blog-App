// import rateLimit from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import { redis } from "../config/redis.js";

// export const commentRateLimiter = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redis.call(...args),
//   }),

//   windowMs: 60 * 1000, // 1 minute
//   max: 5, // 5 comments per minute

//   keyGenerator: (req) => req.user?.userId || req.ip,

//   handler: (_, res) => {
//     res.status(429).json({
//       message: "Too many comments. Please slow down.",
//     });
//   },
// });
