import { kafka } from "./client.js";

export const producer = kafka.producer();

export const initProducer = async () => {
  await producer.connect();
  console.log(" Kafka Producer Connected");
};
