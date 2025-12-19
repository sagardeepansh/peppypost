import mongoose from "mongoose";

const smtpSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      trim: true,
    },
    port: {
      type: Number,
      min: 1,
      max: 65535,
    },
    secure: Boolean,
    username: String,
    password: {
      type: String,
      select: false,
    },
    fromEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    smtp: smtpSchema,
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User ||
  mongoose.model("User", userSchema);
