import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { setSessionUserId } from "@/lib/auth";
import { randomUUID } from "crypto";

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
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const email = body.email?.trim();
  const name = body.name?.trim();
  const role = body.role ?? "DEV";

  const resolvedEmail = email ?? `user-${randomUUID()}@proger.local`;
  const resolvedName = name || resolvedEmail.split("@")[0];

  try {
    const user = email
      ? await prisma.user.upsert({
          where: { email: resolvedEmail },
          update: { name: resolvedName, role },
          create: { email: resolvedEmail, name: resolvedName, role },
        })
      : await prisma.user.create({
          data: { email: resolvedEmail, name: resolvedName, role },
        });

    await setSessionUserId(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create session. Check database connectivity." },
      { status: 500 }
    );
  }
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

  await setSessionUserId(user.id);

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
