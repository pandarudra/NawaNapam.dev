import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username } = body;

    // Basic validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field =
        existingUser.email === email
          ? "Email"
          : existingUser.username === username
            ? "Username"
            : "User";

      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const createdUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        username,
        name: "not set",
        isAnonymous: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    await sendWelcomeEmail(email);

    return NextResponse.json(
      { message: "User created successfully", user: createdUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
