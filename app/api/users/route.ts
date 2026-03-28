import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { setSessionUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeLeaves = searchParams.get("includeLeaves");

  const user = await getCurrentUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  if (includeLeaves) {
    const leaves = await prisma.leave.findMany({
      include: { user: true },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json({
      users,
      meId: user?.id ?? null,
      meRole: user?.role ?? null,
      leaves,
    });
  }

  return NextResponse.json({
    users,
    meId: user?.id ?? null,
    meRole: user?.role ?? null,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const email = body.email?.trim();
  const name = body.name?.trim() || email?.split("@")[0];
  const role = body.role ?? "DEV";

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role },
    create: { email, name, role },
  });

  setSessionUserId(user.id);

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const userId = body.userId;
  if (!userId) {
    return NextResponse.json({ error: "User id required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  setSessionUserId(user.id);

  return NextResponse.json({ user });
}

export async function DELETE(request: Request) {
  const current = await getCurrentUser();
  if (!current || current.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const userId = body.id;
  if (!userId) {
    return NextResponse.json({ error: "User id required" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
