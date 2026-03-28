import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ updates: [] });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const recent = searchParams.get("recent");

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (user.role !== "PM") {
    where.project = {
      members: { some: { userId: user.id } },
    };
  }

  const updates = await prisma.update.findMany({
    where,
    include: {
      author: true,
      project: recent ? true : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: recent ? 5 : undefined,
  });

  return NextResponse.json({ updates });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const content = body.content?.trim();
  const projectId = body.projectId;

  if (!content || !projectId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = await prisma.update.create({
    data: {
      content,
      projectId,
      authorId: user.id,
    },
  });

  return NextResponse.json({ update });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updateId = body.id;
  if (!updateId) {
    return NextResponse.json({ error: "Update id required" }, { status: 400 });
  }

  const existing = await prisma.update.findUnique({ where: { id: updateId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.authorId !== user.id && user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.update.update({
    where: { id: updateId },
    data: { content: body.content ?? existing.content },
  });

  return NextResponse.json({ update: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updateId = body.id;
  if (!updateId) {
    return NextResponse.json({ error: "Update id required" }, { status: 400 });
  }

  await prisma.update.delete({ where: { id: updateId } });
  return NextResponse.json({ success: true });
}
