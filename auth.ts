import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { hash } from "bcryptjs";
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
          role
        };
      }
    })
  ]
});
