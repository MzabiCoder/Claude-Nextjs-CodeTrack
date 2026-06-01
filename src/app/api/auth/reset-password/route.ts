import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIP, rateLimiters, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req);
    const rl = await checkRateLimit(rateLimiters.resetPassword, ip);
    if (rl.limited) {
      const { body, headers } = rateLimitResponse(rl.retryAfter);
      return NextResponse.json(body, { status: 429, headers });
    }

    const { token, password, confirmPassword } = await req.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } });

    if (!record || !record.identifier.startsWith("reset:")) {
      return NextResponse.json({ error: "InvalidToken" }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "ExpiredToken" }, { status: 400 });
    }

    const email = record.identifier.slice("reset:".length);
    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/auth/reset-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
