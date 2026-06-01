import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cascade delete handled by Prisma relations (onDelete: Cascade on all user relations)
    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/user/delete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
