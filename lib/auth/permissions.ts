import type { User } from "@prisma/client";

import { APP_ROLES, type AppRole } from "@/lib/auth/roles";

export function isAdmin(user: Pick<User, "role"> | { role?: AppRole | null } | null | undefined) {
  return user?.role === APP_ROLES.ADMIN;
}

export function isAgent(user: Pick<User, "role"> | { role?: AppRole | null } | null | undefined) {
  return user?.role === APP_ROLES.AGENT;
}
