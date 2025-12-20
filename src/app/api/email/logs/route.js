import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import { verifyApiAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();

    const user = verifyApiAuth(req);

    const logs = await EmailLog.find({ user: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
