import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "post-system",
  brokers: ["localhost:9092"], // change in prod
});
