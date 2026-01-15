import nodemailer from "nodemailer";
import axios from "axios";
import { connectDB } from "@/lib/mongodb";
import EmailQueue from "@/models/EmailQueue";
import BulkEmailTask from "@/models/BulkEmailTask";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  const BATCH_SIZE = 20;
  const MAX_RETRIES = 2;
  const MAX_ATTACHMENT_MB = 20;

  const emails = await EmailQueue.find({
    status: "PENDING",
    retryCount: { $lt: MAX_RETRIES },
  })
    .limit(BATCH_SIZE)
    .lean();

  if (!emails.length) {
    return Response.json({ success: true, message: "No pending emails" });
  }

  for (const job of emails) {
    try {
      // 1️⃣ Load user SMTP
      const user = await User.findById(job.user).select("+smtp.password");
      if (!user?.smtp) throw new Error("SMTP not configured");

      const transporter = nodemailer.createTransport({
        host: user.smtp.host,
        port: Number(user.smtp.port),
        secure: user.smtp.secure,
        auth: {
          user: user.smtp.username,
          pass: user.smtp.password,
        },
      });

      // 2️⃣ Build attachments (stream from URL)
      let attachments = [];

      if (Array.isArray(job.attachments) && job.attachments.length) {
        attachments = await Promise.all(
          job.attachments.map(async (fileUrl) => {
            const res = await axios({
              url: fileUrl,
              method: "GET",
              responseType: "stream",
              timeout: 15000,
            });

            const size =
              Number(res.headers["content-length"] || 0) /
              (1024 * 1024);

            if (size > MAX_ATTACHMENT_MB) {
              throw new Error(
                `Attachment exceeds ${MAX_ATTACHMENT_MB}MB limit`
              );
            }

            return {
              filename: fileUrl.split("/").pop(),
              content: res.data, // STREAM
            };
          })
        );
      }

      // 3️⃣ Send mail
      await transporter.sendMail({
        from: user.smtp.fromEmail,
        to: job.to,
        subject: job.subject,
        html: job.body,
        attachments,
      });

      // 4️⃣ Update queue + logs
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
      console.error("Email failed:", err.message);

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

  // 5️⃣ Mark completed tasks
  await BulkEmailTask.updateMany(
    {
      $expr: {
        $eq: ["$total", { $add: ["$sent", "$failed"] }],
      },
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
