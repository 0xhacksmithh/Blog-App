import amqp from "amqplib";
import { rabbitMq_url } from "../config/index.js";

/// RabbitMQ connection
export let channel, connection;

export async function connectRabbitMQwithRetry(retries = 2, delay = 3000) {
  while (retries) {
    try {
      connection = await amqp.connect(rabbitMq_url);
      channel = await connection.createChannel();
      await channel.assertQueue("post_created");
      console.log("Connection to RabbitMQ Sucessfull");
      break;
    } catch (error) {
      console.log("Connection to RabbitMQ Failed");
      console.log(error);
      retries--;
      console.log(`Retrying Again :: Remaing -- ${retries}`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
