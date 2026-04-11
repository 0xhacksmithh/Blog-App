import amqp from "amqplib";

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function connectRabbitMQ(retries = 10) {
  while (retries > 0) {
    try {
      const res = await amqp.connect("amqp://localhost:5672");
      console.log(`RabitMq Connected...`);
      return res;
    } catch (err) {
      console.log("RabbitMQ not ready, retrying...");
      retries--;
      await sleep(5000);
    }
  }
  throw new Error("RabbitMQ connection failed");
}

async function startListening() {
  try {
    const connection = await connectRabbitMQ();
    const channel = await connection.createChannel();

    await channel.assertQueue("task_created", { durable: true });

    console.log("Notification Service listening...");

    channel.consume("task_created", (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      console.log("New task:", data.title);
      channel.ack(msg);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

startListening();
