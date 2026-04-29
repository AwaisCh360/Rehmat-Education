import { readFile } from "node:fs/promises";
import path from "node:path";

import { hash } from "bcryptjs";

import { db } from "@/lib/db";
import { APP_ROLES } from "@/lib/auth/roles";
import { extractProgramRecords, toProgramPersistence } from "@/lib/programs/parser";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function main() {
  const datasetPath = path.join(process.cwd(), "programs.json");
  const raw = await readFile(datasetPath, "utf8");
  const payload = JSON.parse(raw) as unknown;
  const records = extractProgramRecords(payload);
  const programs = records.map(toProgramPersistence);

  await db.program.deleteMany();
  await db.user.deleteMany();

  await db.program.createMany({
    data: programs
  });

  const adminEmail = requireEnv("ADMIN_EMAIL").toLowerCase();
  const adminName = requireEnv("ADMIN_NAME");
  const adminPassword = await hash(requireEnv("ADMIN_PASSWORD"), 10);
  const agentEmail = requireEnv("AGENT_EMAIL").toLowerCase();
  const agentName = requireEnv("AGENT_NAME");
  const agentPassword = await hash(requireEnv("AGENT_PASSWORD"), 10);

  await db.user.createMany({
    data: [
      {
        email: adminEmail,
        name: adminName,
        passwordHash: adminPassword,
        role: APP_ROLES.ADMIN
      },
      {
        email: agentEmail,
        name: agentName,
        passwordHash: agentPassword,
        role: APP_ROLES.AGENT
      }
    ]
  });

  console.log(`Seeded ${programs.length} programs and 2 users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
