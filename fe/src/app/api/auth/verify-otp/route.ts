import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    // Basic validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }
    const otpkey = `reset-pass-otp-${email}`;
    const storedOtp = await redis.get(otpkey!);

    if (storedOtp !== otp) {
      return NextResponse.json(
        {
          error: "Invalid or expired OTP",
          // storedOtp,
          // otp,
          // typeofStoredOtp: typeof storedOtp,
          // typeofOtp: typeof otp,
          // equalCheck: equal(storedOtp, otp),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error,
      },
      { status: 500 }
    );
  }
}
