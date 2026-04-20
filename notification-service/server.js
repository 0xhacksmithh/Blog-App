import express from "express";
import { connectDB } from "./model/db.js";
import { startConsumer } from "./kafka/consumer.js";

const app = express();

app.use(express.json());

app.listen(3010, () => {
  `Notification App Running On PORT :: 3010`;
});

connectDB();

startConsumer();
