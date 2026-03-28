import { cookies } from "next/headers";

const SESSION_KEY = "pg_session";

export function getSessionUserId() {
  const store = cookies();
  return store.get(SESSION_KEY)?.value ?? null;
}

export function setSessionUserId(userId: string) {
  const store = cookies();
  store.set(SESSION_KEY, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export function clearSession() {
  const store = cookies();
  store.set(SESSION_KEY, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
