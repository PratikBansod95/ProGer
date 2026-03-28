import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId: task.projectId },
    },
  });
  const role = member?.role ?? user.role;

  const body = await request.json();
  const updates: any = {};

  if (role === "STAKEHOLDER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const canEdit = role === "PM" || task.assigneeId === user.id;
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.title) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.priority) updates.priority = body.priority;
  if (body.dueDate !== undefined) {
    updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }

  if (body.status) {
    if (task.status === "REQUEST" && role !== "PM") {
      return NextResponse.json({ error: "Only PM can approve requests" }, { status: 403 });
    }
    updates.status = body.status;
  }

  if (body.assigneeId) {
    if (role !== "PM") {
      return NextResponse.json({ error: "Only PM can reassign tasks" }, { status: 403 });
    }
    updates.assigneeId = body.assigneeId;
  }

  const updated = await prisma.task.update({
    where: { id: params.taskId },
    data: updates,
  });

  if (updates.status && updates.status !== task.status) {
    await prisma.update.create({
      data: {
        projectId: task.projectId,
        authorId: user.id,
        content: `Task moved to ${updates.status}: ${updated.title}`,
      },
    });
  }

  return NextResponse.json({ task: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { taskId: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: params.taskId } });
  return NextResponse.json({ success: true });
}
