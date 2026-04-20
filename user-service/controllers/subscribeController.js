import crypto from "crypto";
import { Subscription } from "../database/subscription.model.js";
import { producer } from "../kafka/producer.js";

export const subscribe = async (req, res) => {
  try {
    const { userId, authorId, mode, contact } = req.body;

    const sub = await Subscription.findOneAndUpdate(
      { user: userId, author: authorId },
      { mode, contact, isActive: true },
      { upsert: true, new: true },
    );

    const event = {
      eventId: crypto.randomUUID(),
      eventType: "SUBSCRIBED",
      version: 1,
      data: {
        userId,
        authorId,
        mode,
        contact,
      },
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: "subscription-events",
      messages: [
        {
          key: authorId,
          value: JSON.stringify(event),
        },
      ],
    });

    res.json({ message: "Subscribed", sub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
