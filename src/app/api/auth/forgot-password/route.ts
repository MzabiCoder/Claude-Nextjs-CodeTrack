import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, password: true },
    });

    // OAuth-only account (no password set)
    if (user && !user.password) {
      return NextResponse.json({ oauthOnly: true }, { status: 200 });
    }

    // If user doesn't exist, still return success to avoid leaking registered emails
    if (user) {
      // Delete any existing reset token for this email before creating a new one
      await prisma.verificationToken.deleteMany({
        where: { identifier: `reset:${email}` },
      });

      const token = randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.verificationToken.create({
        data: { identifier: `reset:${email}`, token, expires },
      });

      const origin = new URL(req.url).origin;
      const resetUrl = `${origin}/reset-password?token=${token}`;

      await resend.emails.send({
        from: "DevStash <onboarding@resend.dev>",
        to: email,
        subject: "Reset your DevStash password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <h2 style="margin:0 0 8px">Reset your password</h2>
            <p style="color:#6b7280;margin:0 0 24px">Hi${user.name ? ` ${user.name}` : ""}, click the button below to reset your DevStash password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Reset password</a>
            <p style="color:#9ca3af;font-size:13px;margin:24px 0 0">Or copy this link: ${resetUrl}</p>
            <p style="color:#9ca3af;font-size:13px;margin:8px 0 0">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/auth/forgot-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
