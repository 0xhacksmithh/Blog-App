import { kafka } from "./client.js";
import { redis } from "../config/redis.js";

const consumer = kafka.consumer({ groupId: "post-group" });

export const startConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({ topic: "post-like" });
  await consumer.subscribe({ topic: "post-unlike" });
  await consumer.subscribe({ topic: "post-comment" });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      const { postId, userId } = data;

      try {
        switch (topic) {
          case "post-like":
            await redis.sadd(`post:likes:${postId}`, userId);
            await redis.srem(`post:unlikes:${postId}`, userId); // remove conflict
            break;

          case "post-unlike":
            await redis.sadd(`post:unlikes:${postId}`, userId);
            await redis.srem(`post:likes:${postId}`, userId);
            break;

          case "post-comment":
            await redis.rpush(
              `post:comments:${postId}`,
              JSON.stringify({
                readerId: data.userId,
                readerName: data.userName,
                text: data.text,
              }),
            );
            break;
        }

        // Mark post as dirty
        await redis.sadd("dirty:posts", postId);

        console.log(`Processed ${topic}`);
      } catch (err) {
        console.error("Error processing event:", err);
      }
    },
  });
};
