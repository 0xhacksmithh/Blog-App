import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SERVICES } from "./config/services.js";
import rateLimiter from "./middlewares/rateLimit.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(rateLimiter);

// // DEBUGING INCOMING URL
// // Global request logger (incoming)
// app.use((req, res, next) => {
//   console.log(" GATEWAY INCOMING");
//   console.log("Method:", req.method);
//   console.log("Original URL:", req.originalUrl);
//   console.log("---------------------------");
//   next();
// });

/**
 * USER SERVICE ROUTES
 * /users
 */
app.use(
  "/users",
  createProxyMiddleware({
    target: `${SERVICES.USER + "/users"}`,
    changeOrigin: true,
    logLevel: "debug",
  }),
);

/**
 * POST SERVICE ROUTES
 * /posts
 */
app.use(
  "/posts",
  createProxyMiddleware({
    target: `${SERVICES.POST + "/posts"}`,
    changeOrigin: true,

    // ///////////////////////////////
    // //  Log what is being forwarded
    // onProxyReq: (proxyReq, req, res) => {
    //   console.log(" FORWARDED REQUEST");
    //   console.log("Method:", req.method);
    //   console.log("Forwarded Path:", proxyReq.path);
    //   console.log("Target URL:", SERVICES.USER + proxyReq.path);
    //   console.log("---------------------------");
    // },

    // //  Log response from service
    // onProxyRes: (proxyRes, req, res) => {
    //   console.log(" RESPONSE FROM USER SERVICE");
    //   console.log("Status:", proxyRes.statusCode);
    //   console.log("---------------------------");
    // },

    // // Error handling
    // onError: (err, req, res) => {
    //   console.error(" PROXY ERROR:", err.message);
    //   res.status(500).json({
    //     message: "Gateway Error",
    //     error: err.message,
    //   });
    // },
  }),
);

/*
*The issue with http-proxy-middleware not working for POST requests while working for GET requests typically 
occurs when a body-parser middleware is used before the proxy middleware. 
The body-parser consumes the incoming request stream, leaving nothing for the proxy to forward. 
*/
app.use(express.json()); //

app.listen(8080, () => {
  console.log("🚀 API Gateway running on port 8080");
});
