import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ projects: [] });
  }

  const where =
    user.role === "PM"
      ? {}
      : {
          members: {
            some: { userId: user.id },
          },
        };

  const projects = await prisma.project.findMany({
    where,
    include: { members: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const name = body.name?.trim();
  const description = body.description?.trim() || "";

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      members: {
        create: [{ userId: user.id, role: user.role }],
      },
      note: {
        create: { content: "" },
      },
    },
    include: { members: true },
  });

  return NextResponse.json({ project });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const projectId = body.id;
  if (!projectId) {
    return NextResponse.json({ error: "Project id required" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: body.name,
      description: body.description,
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const projectId = body.id;
  if (!projectId) {
    return NextResponse.json({ error: "Project id required" }, { status: 400 });
  }

  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ success: true });
}
