import mongoose from "mongoose";

const BulkEmailTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
    },
    title: {
      type: String,
      trim: true,
    },

    total: {
      type: Number,
      required: true,
      default: 0,
    },

    sent: {
      type: Number,
      default: 0,
    },

    failed: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    meta: {
      type: Object, // optional: filters, campaign data, template id, etc.
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Prevent model overwrite error in Next.js
export default mongoose.models.BulkEmailTask ||
  mongoose.model("BulkEmailTask", BulkEmailTaskSchema);
