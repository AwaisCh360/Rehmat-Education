import type { NextAuthConfig } from "next-auth";

import { APP_ROLES, type AppRole } from "@/lib/auth/roles";

const configuredSecrets = [process.env.AUTH_SECRET, process.env.AUTH_SECRET_PREVIOUS].filter(
  (value): value is string => Boolean(value && value.trim())
);

const authSecret = configuredSecrets.length > 1 ? configuredSecrets : configuredSecrets[0];

const authConfig = {
  providers: [],
  secret: authSecret,
  session: {
    strategy: "jwt"
  },
  trustHost: true,
  pages: {
    signIn: "/login"
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
        token.mustChangePassword = user.mustChangePassword ?? false;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as AppRole | undefined) ?? APP_ROLES.AGENT;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }

      return session;
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
