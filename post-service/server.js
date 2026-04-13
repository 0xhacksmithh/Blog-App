import express from "express";
import {
  addComment,
  createPost,
  deletePost,
  getComments,
  likePost,
  unlikePost,
  updatePost,
} from "./controllers/postControllers.js";
import { connectDB } from "./database/db.js";
import { port } from "./config/index.js";
import { authenticate } from "./middleware/auth.middleware.js";
// import { commentRateLimiter } from "./middleware/rateLimit.middleware.js";
import { connectRabbitMQwithRetry } from "./rabbitmq/connectRabbitMQ.js";

const app = express();

app.use(express.json());

// // Debug logger (see what service actually receives)
// app.use((req, res, next) => {
//   console.log("🎯 USER SERVICE RECEIVED");
//   console.log("Method:", req.method);
//   console.log("URL:", req.url);
//   console.log("---------------------------");
//   next();
// });

// Routes
app.get("/posts", (req, res) => {
  res.json({ message: "Heloo from Post Microservice" });
});

app.post("/posts", authenticate, createPost);
app.put("/posts/:postId", authenticate, updatePost);
app.delete("/posts/:postId", authenticate, deletePost);

//// Like, Dislike Routes
app.post("/posts/:postId/like", authenticate, likePost);
app.post("/posts/:postId/unlike", authenticate, unlikePost);

//// Comments Routes
app.post(
  "/posts/:postId/comment",
  authenticate,
  //  commentRateLimiter,
  addComment,
);
app.get("/posts/:postId/comments", getComments);

////

app.listen(port, () => {
  console.log(`Server is running on port :: ${port}`);
});

connectDB();
connectRabbitMQwithRetry();
