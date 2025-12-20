import { verifyApiAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    // ✅ Authenticate user
    const user = verifyApiAuth(req);
    

    const body = await req.json();
    const { host, port, secure, username, password, fromEmail } = body;

    if (!host || !port || !username || !password) {
      return new Response(
        JSON.stringify({ message: "Missing required SMTP fields" }),
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(user.userId, {
      smtp: {
        host,
        port,
        secure,
        username,
        password,
        fromEmail,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "SMTP settings saved successfully",
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Unauthorized or failed to save SMTP settings",
      }),
      { status: 401 }
    );
  }
}
export async function GET(req) {
  try {
    await connectDB();

    const user = verifyApiAuth(req);

    const data = await User.findOne({ _id: user.userId }).select("+smtp.password");;

    // console.log('data', data)

    return Response.json({ data: data?.smtp }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

