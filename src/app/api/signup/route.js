import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password, name, otp } = await req.json();

    if (!email || !password || !otp) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      name,
      password: hashedPassword,
    });

    await Otp.deleteOne({ email });

    return NextResponse.json(
      { success: true, message: "Signup successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
