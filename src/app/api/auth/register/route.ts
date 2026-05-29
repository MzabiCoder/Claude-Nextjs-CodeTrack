import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, email, password: hashed } });

    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const origin = new URL(req.url).origin;
    const verifyUrl = `${origin}/api/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: "DevStash <onboarding@resend.dev>",
      to: email,
      subject: "Verify your DevStash email",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="margin:0 0 8px">Verify your email</h2>
          <p style="color:#6b7280;margin:0 0 24px">Hi ${name}, click the button below to verify your DevStash account. This link expires in 24 hours.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Verify email</a>
          <p style="color:#9ca3af;font-size:13px;margin:24px 0 0">Or copy this link: ${verifyUrl}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
