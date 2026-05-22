import { BlogPost } from "../database/blogPost.model.js";
import { producer } from "../kafka/producer.js";

export const createPost = async (req, res) => {
  try {
    /* ===============================
       Authorization Check
    ================================ */
    if (!req.user || !["author", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only authors can create posts",
      });
    }

    /* ===============================
       Validate Input
    ================================ */
    const { title, description, content } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({
        message: "Title, description and content are required",
      });
    }

    /* ===============================
       Create Post
    ================================ */
    const post = await BlogPost.create({
      title,
      description,
      content,
      authorId: req.user.userId, // MongoDB ObjectId from User service
    });

    ////////// Kafka Connection ///////////
    //  Produce minimal event
    const event = {
      eventType: "POST_CREATED",
      version: 1,
      data: {
        authorId: req.user.userId,
        postId: post._id.toString(),
      },
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: "post-created",
      messages: [
        {
          key: req.user.userId.toString(), // partition by author
          value: JSON.stringify(event),
        },
      ],
    });

    return res.status(201).json({
      message: "Post created successfully",
      message: "Post Notification queued in Kafka",
      post,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, description, content } = req.body;
    const post = await BlogPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    /* Authorization */
    if (
      req.user.role !== "admin" &&
      post.authorId.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to update this post" });
    }

    post.title = title ?? post.title;
    post.description = description ?? post.description;
    post.content = content ?? post.content;

    await post.save();

    res.json({ message: "Post updated", post });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (
      req.user.role !== "admin" &&
      post.authorId.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  await producer.send({
    topic: "post-like",
    messages: [
      {
        value: JSON.stringify({ postId, userId }),
      },
    ],
  });
  /*
  const post = await BlogPost.findOneAndUpdate(
    { _id: postId, likedBy: { $ne: userId } },
    {
      $addToSet: { likedBy: userId },
      $inc: { likes: 1 },
    },
    { new: true },
  );

  if (!post) {
    return res.status(400).json({ message: "Already liked or post not found" });
  }

  res.json({ message: "Post liked", likes: post.likes });
  */
  res.json({ message: "Like event queued" });
};

export const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  await producer.send({
    topic: "post-unlike",
    messages: [
      {
        value: JSON.stringify({ postId, userId }),
      },
    ],
  });
  /*
  const post = await BlogPost.findOneAndUpdate(
    { _id: postId, likedBy: userId },
    {
      $pull: { likedBy: userId },
      $inc: { likes: -1 },
    },
    { new: true },
  );

  if (!post) {
    return res.status(400).json({ message: "Post not liked yet" });
  }

  res.json({ message: "Post unliked", likes: post.likes });
  */
  res.json({ message: "Like event queued" });
};

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Comment text required" });
  }

  await producer.send({
    topic: "post-comment",
    messages: [
      {
        value: JSON.stringify({
          postId,
          userId: req.user.userId,
          userName: req.user.name,
          text,
        }),
      },
    ],
  });
  /*
  const post = await BlogPost.findByIdAndUpdate(
    postId,
    {
      $push: {
        comments: {
          readerId: req.user.userId,
          readerName: req.user.name,
          text,
        },
      },
    },
    { new: true },
  );

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.status(201).json({ message: "Comment added" });
  */
  res.status(202).json({ message: "Comment queued" });
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const post = await BlogPost.findById(postId, {
    comments: { $slice: [(page - 1) * limit, limit] },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json({
    page,
    limit,
    comments: post.comments,
  });
};
