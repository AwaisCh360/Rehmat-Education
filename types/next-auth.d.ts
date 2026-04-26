import { type DefaultSession } from "next-auth";

import type { AppRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AppRole;
      mustChangePassword?: boolean;
    };
  }

  interface User {
    role: AppRole;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    mustChangePassword?: boolean;
  }
}
