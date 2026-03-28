import { cookies } from "next/headers";

const SESSION_KEY = "pg_session";

export async function getSessionUserId() {
  const store = await cookies();
  return store.get(SESSION_KEY)?.value ?? null;
}

export async function setSessionUserId(userId: string) {
  const store = await cookies();
  store.set(SESSION_KEY, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(SESSION_KEY, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
