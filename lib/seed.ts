import { prisma } from "@/lib/prisma";

export async function ensureSeedData() {
  const projectCount = await prisma.project.count();
  if (projectCount > 0) return;

  const [pm, dev, stakeholder] = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Ava Patel",
        email: "ava.pm@proger.io",
        role: "PM",
      },
    }),
    prisma.user.create({
      data: {
        name: "Leo Chen",
        email: "leo.dev@proger.io",
        role: "DEV",
      },
    }),
    prisma.user.create({
      data: {
        name: "Maya Singh",
        email: "maya.stakeholder@proger.io",
        role: "STAKEHOLDER",
      },
    }),
  ]);

  const project = await prisma.project.create({
    data: {
      name: "ProGer Launch",
      description: "Ship the core MVP for the stakeholder communication platform.",
      members: {
        create: [
          { userId: pm.id, role: "PM" },
          { userId: dev.id, role: "DEV" },
          { userId: stakeholder.id, role: "STAKEHOLDER" },
        ],
      },
      note: {
        create: {
          content: "Weekly cadence: Monday kick-off, Thursday stakeholder preview.",
        },
      },
    },
  });

  const tasks = await prisma.task.createMany({
    data: [
      {
        title: "Design dashboard layout",
        description: "Build the base layout and navigation patterns.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: dev.id,
        creatorId: pm.id,
        projectId: project.id,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      },
      {
        title: "Define stakeholder update cadence",
        description: "Align on weekly updates and channel expectations.",
        status: "REVIEW",
        priority: "MEDIUM",
        assigneeId: pm.id,
        creatorId: pm.id,
        projectId: project.id,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      },
      {
        title: "Request metrics dashboard",
        description: "Stakeholder request for launch metrics visibility.",
        status: "REQUEST",
        priority: "LOW",
        assigneeId: stakeholder.id,
        creatorId: stakeholder.id,
        projectId: project.id,
      },
    ],
  });

  await prisma.update.createMany({
    data: [
      {
        content: "Project created and team onboarded.",
        projectId: project.id,
        authorId: pm.id,
      },
      {
        content: "Design work kicked off for dashboard layout.",
        projectId: project.id,
        authorId: dev.id,
      },
    ],
  });

  await prisma.leave.create({
    data: {
      userId: dev.id,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9),
    },
  });

  return tasks;
}
