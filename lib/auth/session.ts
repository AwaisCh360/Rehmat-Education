import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAgentRevoked } from "@/lib/auth/agent-access";
import { APP_ROLES } from "@/lib/auth/roles";

async function getValidatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const role = session.user.role === APP_ROLES.ADMIN ? APP_ROLES.ADMIN : APP_ROLES.AGENT;

  if (role === APP_ROLES.AGENT && (await isAgentRevoked(session.user.id))) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role
  };
}

export async function requireUser() {
  const user = await getValidatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/programs");
  }

  return user;
}

export async function requireApiUser() {
  const user = await getValidatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user;
}

export async function requireApiAdmin() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session.user;
}
