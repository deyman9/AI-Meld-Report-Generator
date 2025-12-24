import { getServerSession as getNextAuthSession } from "next-auth/next";
import { authOptions } from "./options";

export async function getSession() {
  return await getNextAuthSession(authOptions);
}

export async function getServerSession() {
  return await getNextAuthSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

