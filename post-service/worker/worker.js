import { redis } from "../config/redis.js";
import { BlogPost } from "../database/blogPost.model.js";

setInterval(async () => {
  try {
    const postIds = await redis.smembers("dirty:posts");

    if (postIds.length === 0) return;

    const bulkOps = [];

    for (const postId of postIds) {
      const [likes, unlikes, comments] = await Promise.all([
        redis.smembers(`post:likes:${postId}`),
        redis.smembers(`post:unlikes:${postId}`),
        redis.lrange(`post:comments:${postId}`, 0, -1),
      ]);

      const parsedComments = comments.map((c) => JSON.parse(c));

      const update = {};

      if (likes.length) {
        update.$addToSet = {
          likedBy: { $each: likes },
        };
        update.$inc = {
          likes: likes.length,
        };
      }

      if (unlikes.length) {
        update.$pull = {
          likedBy: { $in: unlikes },
        };

        update.$inc = {
          likes: (update.$inc?.likes || 0) - unlikes.length,
        };
      }

      if (parsedComments.length) {
        update.$push = {
          comments: { $each: parsedComments },
        };
      }

      if (Object.keys(update).length > 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: postId },
            update,
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await BlogPost.bulkWrite(bulkOps);
      console.log(`Flushed ${bulkOps.length} posts`);
    }

    // Cleanup after success
    for (const postId of postIds) {
      await redis.del(
        `post:likes:${postId}`,
        `post:unlikes:${postId}`,
        `post:comments:${postId}`,
      );
      await redis.srem("dirty:posts", postId);
    }
  } catch (err) {
    console.error("Flush failed:", err);
  }
}, 2000);
