import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

import authConfig from "@/auth.config";
import { isAgentRevoked } from "@/lib/auth/agent-access";
import { db } from "@/lib/db";
import { APP_ROLES, type AppRole } from "@/lib/auth/roles";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type DefaultAccountConfig = {
  role: AppRole;
  email?: string;
  name?: string;
  password?: string;
};

type AuthenticatedAppUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  mustChangePassword: boolean;
};

const defaultAccounts: DefaultAccountConfig[] = [
  {
    role: APP_ROLES.ADMIN,
    email: process.env.ADMIN_EMAIL,
    name: process.env.ADMIN_NAME,
    password: process.env.ADMIN_PASSWORD
  },
  {
    role: APP_ROLES.AGENT,
    email: process.env.AGENT_EMAIL,
    name: process.env.AGENT_NAME,
    password: process.env.AGENT_PASSWORD
  }
];

async function syncDefaultAccountFromEnv(email: string, password: string) {
  const matched = defaultAccounts.find((account) => account.email?.toLowerCase() === email);

  if (!matched || !matched.password || matched.password !== password) {
    return null;
  }

  const passwordHash = await hash(password, 10);
  const user = await db.user.upsert({
    where: {
      email
    },
    create: {
      email,
      name: matched.name ?? (matched.role === APP_ROLES.ADMIN ? "Platform Admin" : "Admissions Agent"),
      passwordHash,
      role: matched.role
    },
    update: {
      name: matched.name ?? (matched.role === APP_ROLES.ADMIN ? "Platform Admin" : "Admissions Agent"),
      passwordHash,
      role: matched.role
    }
  });

  return user;
}

async function resolveGoogleAccount(emailValue: string | null | undefined, nameValue: string | null | undefined, profile: unknown): Promise<AuthenticatedAppUser | null> {
  const email = emailValue?.toLowerCase().trim();

  if (!email || !isGoogleEmailVerified(profile)) {
    return null;
  }

  const existingUser = await db.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    if (existingUser.role === APP_ROLES.AGENT && (await isAgentRevoked(existingUser.id))) {
      return null;
    }

    return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role === APP_ROLES.ADMIN ? APP_ROLES.ADMIN : APP_ROLES.AGENT,
      mustChangePassword: existingUser.mustChangePassword
    };
  }

  const matchedDefaultAccount = defaultAccounts.find((account) => account.email?.toLowerCase() === email);
  const shouldAutoCreateAgent = process.env.GOOGLE_AUTO_CREATE_AGENTS === "true";

  if (!matchedDefaultAccount && !shouldAutoCreateAgent) {
    return null;
  }

  const role = matchedDefaultAccount?.role ?? APP_ROLES.AGENT;
  const passwordHash = await hash(matchedDefaultAccount?.password ?? randomUUID(), 10);
  const user = await db.user.create({
    data: {
      email,
      name: nameValue?.trim() || matchedDefaultAccount?.name || (role === APP_ROLES.ADMIN ? "Platform Admin" : "Admissions Agent"),
      passwordHash,
      role
    }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === APP_ROLES.ADMIN ? APP_ROLES.ADMIN : APP_ROLES.AGENT,
    mustChangePassword: user.mustChangePassword
  };
}

function isGoogleEmailVerified(profile: unknown) {
  if (!profile || typeof profile !== "object" || !("email_verified" in profile)) {
    return true;
  }

  return (profile as { email_verified?: unknown }).email_verified !== false;
}

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();

        const user = await db.user.findUnique({
          where: {
            email
          }
        });

        let authUser = user;

        if (authUser) {
          const isValid = await compare(parsed.data.password, authUser.passwordHash);

          if (!isValid) {
            authUser = await syncDefaultAccountFromEnv(email, parsed.data.password);
          }
        } else {
          authUser = await syncDefaultAccountFromEnv(email, parsed.data.password);
        }

        if (!authUser) {
          return null;
        }

        if (authUser.role === APP_ROLES.AGENT && (await isAgentRevoked(authUser.id))) {
          return null;
        }

        const role: AppRole = authUser.role === APP_ROLES.ADMIN ? APP_ROLES.ADMIN : APP_ROLES.AGENT;

        return {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          role,
          mustChangePassword: authUser.mustChangePassword
        };
      }
    }),
    ...(googleProvider ? [googleProvider] : [])
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") {
        return true;
      }

      const appUser = await resolveGoogleAccount(user.email, user.name, profile);

      if (!appUser) {
        return false;
      }

      user.id = appUser.id;
      user.email = appUser.email;
      user.name = appUser.name;
      user.role = appUser.role;
      user.mustChangePassword = appUser.mustChangePassword;

      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        const role = user?.role === APP_ROLES.ADMIN ? APP_ROLES.ADMIN : user?.role === APP_ROLES.AGENT ? APP_ROLES.AGENT : null;
        const appUser = role
          ? {
              id: user.id,
              email: user.email ?? "",
              name: user.name ?? "",
              role,
              mustChangePassword: user.mustChangePassword ?? false
            }
          : await resolveGoogleAccount(user?.email ?? token.email, user?.name ?? token.name, profile);

        if (appUser) {
          token.sub = appUser.id;
          token.role = appUser.role;
          token.email = appUser.email;
          token.name = appUser.name;
          token.mustChangePassword = appUser.mustChangePassword;
        }

        return token;
      }

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
});
