import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    files: [{ type: String }], // store file paths or URLs
  },
  { timestamps: true }
);

// Prevent model overwrite on hot reload
export default mongoose.models.Template ||
  mongoose.model("Template", TemplateSchema);
