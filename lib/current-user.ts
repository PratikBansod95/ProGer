import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";

export async function getCurrentUser() {
  await ensureSeedData();
  const sessionId = getSessionUserId();
  if (sessionId) {
    const user = await prisma.user.findUnique({ where: { id: sessionId } });
    if (user) return user;
  }

  return null;
}
