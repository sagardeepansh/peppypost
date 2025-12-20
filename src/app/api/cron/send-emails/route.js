import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import EmailQueue from "@/models/EmailQueue";
import BulkEmailTask from "@/models/BulkEmailTask";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";
import path from "path";
import fs from "fs";

export async function GET() {
  await connectDB();

  const BATCH_SIZE = 20;
  const MAX_RETRIES = 2;

  const emails = await EmailQueue.find({
    status: "PENDING",
    retryCount: { $lt: MAX_RETRIES },
  })
    .limit(BATCH_SIZE)
    .lean();

  if (emails.length === 0) {
    return Response.json({ success: true, message: "No pending emails" });
  }

  for (const job of emails) {
    try {
      const user = await User.findById(job.user).select("+smtp.password");

      const transporter = nodemailer.createTransport({
        host: user.smtp.host,
        port: Number(user.smtp.port),
        secure: user.smtp.secure,
        auth: {
          user: user.smtp.username,
          pass: user.smtp.password,
        },
      });
      const attachments = [];

      if (Array.isArray(job.attachments)) {
        for (const filePath of job.attachments) {
          const absolutePath = path.join(process.cwd(), "public", filePath);
          if (fs.existsSync(absolutePath)) {
            attachments.push({
              filename: path.basename(filePath),
              path: absolutePath,
            });
          }
        }
      }

      await transporter.sendMail({
        from: user.smtp.fromEmail,
        to: job.to,
        subject: job.subject,
        html: job.body,
        attachments,
      });
     

      await EmailQueue.findByIdAndUpdate(job._id, {
        status: "SENT",
      });

      await EmailLog.create({
        user: job.user,
        to: [job.to],
        subject: job.subject,
        body: job.body,
        attachments: job.attachments,
        status: "SENT",
      });

      await BulkEmailTask.findByIdAndUpdate(job.taskId, {
        $inc: { sent: 1 },
        $set: { status: "PROCESSING", startedAt: new Date() },
      });
    } catch (err) {
      await EmailQueue.findByIdAndUpdate(job._id, {
        status: "FAILED",
        retryCount: job.retryCount + 1,
        error: err.message,
      });

      await EmailLog.create({
        user: job.user,
        to: [job.to],
        subject: job.subject,
        body: job.body,
        attachments: job.attachments,
        status: "FAILED",
        error: err.message,
      });

      await BulkEmailTask.findByIdAndUpdate(job.taskId, {
        $inc: { failed: 1 },
      });
    }
  }

  // Complete finished tasks
  await BulkEmailTask.updateMany(
    {
      $expr: { $eq: ["$total", { $add: ["$sent", "$failed"] }] },
    },
    {
      status: "COMPLETED",
      completedAt: new Date(),
    }
  );

  return Response.json({
    success: true,
    processed: emails.length,
  });
}
