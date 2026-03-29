import { prisma } from "@/lib/prisma";

export async function ensureSeedData() {
  const [
    pm,
    dev,
    stakeholder,
    content,
    backend,
    frontend,
    qa,
    srDevs,
  ] = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: "ava.pm@proger.io" },
      update: { name: "Ava Patel", role: "PM" },
      create: {
        name: "Ava Patel",
        email: "ava.pm@proger.io",
        role: "PM",
      },
    }),
    prisma.user.upsert({
      where: { email: "leo.dev@proger.io" },
      update: { name: "Leo Chen", role: "DEV" },
      create: {
        name: "Leo Chen",
        email: "leo.dev@proger.io",
        role: "DEV",
      },
    }),
    prisma.user.upsert({
      where: { email: "maya.stakeholder@proger.io" },
      update: { name: "Maya Singh", role: "STAKEHOLDER" },
      create: {
        name: "Maya Singh",
        email: "maya.stakeholder@proger.io",
        role: "STAKEHOLDER",
      },
    }),
    prisma.user.upsert({
      where: { email: "nina.content@proger.io" },
      update: { name: "Nina Rao (Content)", role: "DEV" },
      create: {
        name: "Nina Rao (Content)",
        email: "nina.content@proger.io",
        role: "DEV",
      },
    }),
    prisma.user.upsert({
      where: { email: "arjun.backend@proger.io" },
      update: { name: "Arjun Mehta (Backend)", role: "DEV" },
      create: {
        name: "Arjun Mehta (Backend)",
        email: "arjun.backend@proger.io",
        role: "DEV",
      },
    }),
    prisma.user.upsert({
      where: { email: "sara.frontend@proger.io" },
      update: { name: "Sara Kim (Frontend/App)", role: "DEV" },
      create: {
        name: "Sara Kim (Frontend/App)",
        email: "sara.frontend@proger.io",
        role: "DEV",
      },
    }),
    prisma.user.upsert({
      where: { email: "omar.qa@proger.io" },
      update: { name: "Omar Ali (QA)", role: "DEV" },
      create: {
        name: "Omar Ali (QA)",
        email: "omar.qa@proger.io",
        role: "DEV",
      },
    }),
    prisma.user.upsert({
      where: { email: "rhea.srdevs@proger.io" },
      update: { name: "Rhea Das (Sr. Devs)", role: "DEV" },
      create: {
        name: "Rhea Das (Sr. Devs)",
        email: "rhea.srdevs@proger.io",
        role: "DEV",
      },
    }),
  ]);

  const existingProject = await prisma.project.findFirst({
    where: { name: "ProGer Launch" },
  });

  const project =
    existingProject ??
    (await prisma.project.create({
      data: {
        name: "ProGer Launch",
        description:
          "Ship the core MVP for the stakeholder communication platform.",
        note: {
          create: {
            content:
              "Weekly cadence: Monday kick-off, Thursday stakeholder preview.",
          },
        },
      },
    }));

  await prisma.$transaction([
    prisma.projectMember.upsert({
      where: { userId_projectId: { userId: pm.id, projectId: project.id } },
      update: { role: "PM" },
      create: { userId: pm.id, projectId: project.id, role: "PM" },
    }),
    prisma.projectMember.upsert({
      where: { userId_projectId: { userId: dev.id, projectId: project.id } },
      update: { role: "DEV" },
      create: { userId: dev.id, projectId: project.id, role: "DEV" },
    }),
    prisma.projectMember.upsert({
      where: {
        userId_projectId: { userId: stakeholder.id, projectId: project.id },
      },
      update: { role: "STAKEHOLDER" },
      create: {
        userId: stakeholder.id,
        projectId: project.id,
        role: "STAKEHOLDER",
      },
    }),
    prisma.projectMember.upsert({
      where: {
        userId_projectId: { userId: content.id, projectId: project.id },
      },
      update: { role: "DEV" },
      create: { userId: content.id, projectId: project.id, role: "DEV" },
    }),
    prisma.projectMember.upsert({
      where: {
        userId_projectId: { userId: backend.id, projectId: project.id },
      },
      update: { role: "DEV" },
      create: { userId: backend.id, projectId: project.id, role: "DEV" },
    }),
    prisma.projectMember.upsert({
      where: {
        userId_projectId: { userId: frontend.id, projectId: project.id },
      },
      update: { role: "DEV" },
      create: { userId: frontend.id, projectId: project.id, role: "DEV" },
    }),
    prisma.projectMember.upsert({
      where: { userId_projectId: { userId: qa.id, projectId: project.id } },
      update: { role: "DEV" },
      create: { userId: qa.id, projectId: project.id, role: "DEV" },
    }),
    prisma.projectMember.upsert({
      where: {
        userId_projectId: { userId: srDevs.id, projectId: project.id },
      },
      update: { role: "DEV" },
      create: { userId: srDevs.id, projectId: project.id, role: "DEV" },
    }),
  ]);

  const taskCount = await prisma.task.count({ where: { projectId: project.id } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Design dashboard layout",
          description: "Build the base layout and navigation patterns.",
          status: "IN_PROGRESS",
          priority: "HIGH",
          category: "FRONTEND_APP",
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
          category: "PM",
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
          category: "CONTENT",
          assigneeId: stakeholder.id,
          creatorId: stakeholder.id,
          projectId: project.id,
        },
      ],
    });
  }

  const updateCount = await prisma.update.count({
    where: { projectId: project.id },
  });
  if (updateCount === 0) {
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
  }

  const leaveCount = await prisma.leave.count({ where: { userId: dev.id } });
  if (leaveCount === 0) {
    await prisma.leave.create({
      data: {
        userId: dev.id,
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9),
      },
    });
  }

  return project;
}
