import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { verifyApiAuth } from "@/lib/auth";
import BulkEmailTask from "@/models/BulkEmailTask";
import EmailQueue from "@/models/EmailQueue";
import Template from "@/models/Template";
import UserModel from "@/models/User";

export async function POST(req) {
  await connectDB();

  const user = verifyApiAuth(req);
  const { emails, message, templateId } = await req.json();

  if (!Array.isArray(emails) || emails.length === 0) {
    return Response.json({ error: "Emails array required" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    return Response.json({ error: "Invalid templateId" }, { status: 400 });
  }

  const template = await Template.findById(templateId).lean();
  if (!template) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const masterUser = await UserModel.findById({ _id: template?.createdBy }).lean();
  if (!masterUser?.smtp?.host) {
    return Response.json({ error: true, message: "First Save the SMTP details in setting page" }, { status: 400 });
  }

  const task = await BulkEmailTask.create({
    user: user.userId,
    templateId,
    total: emails.length,
  });

  
  const queueDocs = emails.map(email => ({
    taskId: task._id,
    user: user.userId,
    to: email.trim(),
    subject: template.subject || "New Message",
    body: message,
    attachments: template.files,
  }));

  await EmailQueue.insertMany(queueDocs);

  return Response.json({
    success: true,
    taskId: task._id,
    total: emails.length,
  });
}
