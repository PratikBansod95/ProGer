import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ tasks: [] });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const mine = searchParams.get("mine");
  const withProject = searchParams.get("withProject");

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (mine) where.assigneeId = user.id;
  if (user.role !== "PM") {
    where.project = {
      members: { some: { userId: user.id } },
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: true,
      project: withProject ? true : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const title = body.title?.trim();
  const description = body.description?.trim() || "";
  const projectId = body.projectId;
  const requestedAssignee = body.assigneeId || user.id;
  const priority = body.priority ?? "MEDIUM";
  const dueDate = body.dueDate ? new Date(body.dueDate) : null;

  if (!title || !projectId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });
  const role = member?.role ?? user.role;
  if (!member && role !== "PM") {
    return NextResponse.json({ error: "Not a project member" }, { status: 403 });
  }

  if (role === "DEV" && requestedAssignee !== user.id) {
    return NextResponse.json({ error: "DEV can only assign to self" }, { status: 403 });
  }

  const assigneeId = role === "STAKEHOLDER" ? user.id : requestedAssignee;
  const status = role === "STAKEHOLDER" ? "REQUEST" : body.status ?? "TODO";

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      creatorId: user.id,
      assigneeId,
      status,
      priority,
      dueDate,
    },
  });

  await prisma.update.create({
    data: {
      projectId,
      authorId: user.id,
      content: `Task created: ${title}`,
    },
  });

  return NextResponse.json({ task });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const taskId = body.id;
  if (!taskId) {
    return NextResponse.json({ error: "Task id required" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId: task.projectId },
    },
  });
  const role = member?.role ?? user.role;

  if (role === "STAKEHOLDER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const canEdit = role === "PM" || task.assigneeId === user.id;
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: any = {};
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

  const updated = await prisma.task.update({ where: { id: taskId }, data: updates });

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

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const taskId = body.id;
  if (!taskId) {
    return NextResponse.json({ error: "Task id required" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
