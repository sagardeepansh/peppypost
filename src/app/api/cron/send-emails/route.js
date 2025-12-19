import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import EmailQueue from "@/models/EmailQueue";
import BulkEmailTask from "@/models/BulkEmailTask";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  const BATCH_SIZE = 20;
  const MAX_RETRIES = 3;

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

      await transporter.sendMail({
        from: user.smtp.fromEmail,
        to: job.to,
        subject: job.subject,
        html: job.body,
      });

      await EmailQueue.findByIdAndUpdate(job._id, {
        status: "SENT",
      });

      await EmailLog.create({
        user: job.user,
        to: [job.to],
        subject: job.subject,
        body: job.body,
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
