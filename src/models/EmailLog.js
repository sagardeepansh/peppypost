import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    to: [{ type: String, required: true }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: { type: String },
    body: { type: String },
    from: { type: String },
    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      required: true,
    },
    error: { type: String },
    provider: { type: String, default: "SMTP" },
  },
  { timestamps: true }
);

export default mongoose.models.EmailLog ||
  mongoose.model("EmailLog", emailLogSchema);
