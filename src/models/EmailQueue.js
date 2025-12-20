import mongoose from "mongoose";

const emailQueueSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BulkEmailTask",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    attachments: [{ type: String }],

    to: { type: String, required: true },

    subject: String,
    body: String,

    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },

    retryCount: { type: Number, default: 0 },
    error: String,
  },
  { timestamps: true }
);

export default mongoose.models.EmailQueue ||
  mongoose.model("EmailQueue", emailQueueSchema);
