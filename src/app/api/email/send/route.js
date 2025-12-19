import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Template from "@/models/Template";
import { connectDB } from "@/lib/mongodb";
import { verifyApiAuth } from "@/lib/auth";
import User from "@/models/User";
import EmailLog from "@/models/EmailLog";


export async function POST(req) {
  try {
    await connectDB();
    const user = verifyApiAuth(req);
    const userSMTP = await User.findOne({ _id: user?.userId }).select("+smtp.password");
    const { name } = userSMTP;

    const { emails, message, templateId } = await req.json();

    if (!userSMTP?.smtp?.host) {
      return new Response(
        JSON.stringify({ error: "Please save SMTP details in settings first" }),
        { status: 400 }
      );
    }
    if (!emails || !message || !templateId) { 
      return new Response(
        JSON.stringify({ error: "Email, message, and templateId are required" }),
        { status: 400 }
      );
    }

    // Normalize email → array
    let recipients = [];

    if (Array.isArray(emails)) {
      recipients = emails;
    } else if (typeof emails === "string") {
      recipients = emails.split(",").map((e) => e.trim());
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid email recipients found" }),
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return new Response(
        JSON.stringify({ error: "Invalid template ID" }),
        { status: 400 }
      );
    }

    const template = await Template.findById(templateId).lean();

    if (!template) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404 }
      );
    }

    // Build attachments
    const attachments = [];

    if (Array.isArray(template.files)) {
      for (const filePath of template.files) {
        const absolutePath = path.join(process.cwd(), "public", filePath);
        if (fs.existsSync(absolutePath)) {
          attachments.push({
            filename: path.basename(filePath),
            path: absolutePath,
          });
        }
      }
    }

    const transporter = nodemailer.createTransport({
      host: userSMTP?.smtp?.host,
      port: userSMTP?.smtp?.port,
      secure: userSMTP?.smtp?.secure, // true for 465, false for 587
      auth: {
        user: `${userSMTP?.smtp?.username}`,
        pass: `${userSMTP?.smtp?.password}`,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${userSMTP?.smtp?.fromEmail}>`,
      to: recipients, // ✅ ARRAY OR STRING BOTH OK
      subject: template.subject || "New Message",
      text: message,
      html: `
        <div>
          <p>${message}</p>
        </div>
      `,
      attachments,
    });



    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        recipients: recipients.length,
        attachments: attachments.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Email send error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500 }
    );
  }
}
