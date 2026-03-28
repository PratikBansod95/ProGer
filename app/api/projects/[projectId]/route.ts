import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ project: null }, { status: 401 });
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });
  if (!member && user.role !== "PM") {
    return NextResponse.json({ project: null }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: true } },
      tasks: {
        include: { assignee: true },
        orderBy: { createdAt: "desc" },
      },
      updates: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
      note: true,
    },
  });

  return NextResponse.json({ project });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const noteContent = body.note;
  const addMemberId = body.addMemberId as string | undefined;
  const addMemberRole = body.addMemberRole as
    | "PM"
    | "DEV"
    | "STAKEHOLDER"
    | undefined;

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });
  if (!member && user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (addMemberId) {
    if (user.role !== "PM") {
      return NextResponse.json({ error: "Only PM can add members" }, { status: 403 });
    }
    const roleValue = addMemberRole ?? "DEV";
    await prisma.projectMember.upsert({
      where: {
        userId_projectId: { userId: addMemberId, projectId },
      },
      update: { role: roleValue },
      create: {
        userId: addMemberId,
        projectId,
        role: roleValue,
      },
    });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(noteContent !== undefined
        ? {
            note: {
              upsert: {
                create: { content: noteContent ?? "" },
                update: { content: noteContent ?? "" },
              },
            },
          }
        : {}),
    },
    include: { note: true },
  });

  return NextResponse.json({ project });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ success: true });
}
