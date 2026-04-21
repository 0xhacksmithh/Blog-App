import { kafka } from "./client.js";
import { NotificationSub } from "../model/subscription.model.js";
import { ProcessedEvent } from "../model/processedEvent.model.js";

const consumer = kafka.consumer({ groupId: "notification-group" });

export const startSubConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "subscription-events" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      // idempotency check
      const exists = await ProcessedEvent.findOne({
        eventId: event.eventId,
      });
      if (exists) return;

      const { eventType, data } = event;

      if (eventType === "SUBSCRIBED") {
        await NotificationSub.findOneAndUpdate(
          { userId: data.userId, authorId: data.authorId },
          {
            mode: data.mode,
            contact: data.contact,
            isActive: true,
          },
          { upsert: true },
        );
      }

      if (eventType === "UNSUBSCRIBED") {
        await NotificationSub.updateOne(
          { userId: data.userId, authorId: data.authorId },
          { isActive: false },
        );
      }

      // mark processed
      await ProcessedEvent.create({ eventId: event.eventId });
    },
  });

  console.log(" Kafka Running Subscription-Consumer.....");
};
