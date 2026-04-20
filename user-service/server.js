import express from "express";
import { port } from "./config/index.js";
import { connectDB } from "./database/db.js";
import {
  signupController,
  signinController,
  getAllUsers,
  getReaders,
  getAuthors,
} from "./controllers/userControllers.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { authorizeRoles } from "./middleware/role.middleware.js";
import { startGrpcServer } from "./grpc.js";
import { initProducer } from "./kafka/producer.js";
import { subscribe } from "./controllers/subscribeController.js";

const app = express();

app.use(express.json());

// End-Points

app.post("/users/signup", signupController);

app.post("/users/signin", signinController);

// Admin Only Routes
app.get("/users/allUsers", authenticate, authorizeRoles("admin"), getAllUsers);

app.get("/users/allReaders", authenticate, authorizeRoles("admin"), getReaders);

// Reader
app.get("/users/allAuthors", authenticate, getAuthors);

// Subscribe
app.post("/subscribe", authenticate, subscribe);

// Server
app.listen(port, () => {
  // Express Server
  console.log(`Server is running on port :: 3000`);
});

connectDB(); // DB Connection

startGrpcServer(); // gRPC Server

initProducer(); // kafka Producer
