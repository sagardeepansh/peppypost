import { connectDB } from "@/lib/mongodb";
import { verifyApiAuth } from "@/lib/auth";
import Template from "@/models/Template";

export async function GET(req) {
  try {
    await connectDB();
    const user = verifyApiAuth(req);

    const templates = await Template.find({ createdBy: user?.userId }).sort({ createdAt: -1 });

    return new Response(JSON.stringify(templates), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch templates" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {

    await connectDB();
    const user = verifyApiAuth(req);


    const { name, subject, body, files } = await req.json();

    if (!name || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    const template = await Template.create({
      name,
      subject,
      body,
      files,
      createdBy: user?.userId,
    });

    return new Response(
      JSON.stringify({ success: true, template }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to create template" }),
      { status: 500 }
    );
  }
}

