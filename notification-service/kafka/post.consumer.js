import { kafka } from "../kafka/client.js";
import { NotificationSub } from "../model/subscription.model.js";
import {
  sendEmail,
  sendSMS,
  sendWhatsApp,
} from "../service/notificationSend.js";

const consumer = kafka.consumer({ groupId: "post-group" });

export const startPostConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "post-created" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      const { authorId } = event.data;
      console.log(`Proessing Post notification from AuthorId ${authorId}`);

      const data = await NotificationSub.find({
        authorId,
        isActive: true,
      });

      console.log(data);

      const batch = [];
      const BATCH_SIZE = 10;

      for await (const sub of data) {
        batch.push(sub);

        if (batch.length === BATCH_SIZE) {
          await dispatchBatch(batch);
          batch.length = 0;
        }
      }

      if (batch.length) {
        await dispatchBatch(batch);
      }
    },
  });
  console.log(" Kafka Running Post-Consumer.....");
};

const dispatchBatch = async (subs) => {
  const grouped = {
    email: [],
    sms: [],
    whatsapp: [],
  };

  for (const s of subs) {
    grouped[s.mode].push(s.contact);
  }

  console.log(grouped);

  if (grouped.email.length) await sendEmail(grouped.email);
  if (grouped.sms.length) await sendSMS(grouped.sms);
  if (grouped.whatsapp.length) await sendWhatsApp(grouped.whatsapp);
};
