import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAgentRevoked } from "@/lib/auth/agent-access";
import { APP_ROLES } from "@/lib/auth/roles";
import { db } from "@/lib/db";

async function getValidatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  if (!user) {
    return null;
  }

  if (user.role === APP_ROLES.AGENT && (await isAgentRevoked(user.id))) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === APP_ROLES.ADMIN ? APP_ROLES.ADMIN : APP_ROLES.AGENT
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
