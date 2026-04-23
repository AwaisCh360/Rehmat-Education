import { readFile } from "node:fs/promises";
import path from "node:path";

import { hash } from "bcryptjs";

import { db } from "@/lib/db";
import { APP_ROLES } from "@/lib/auth/roles";
import { extractProgramRecords, toProgramPersistence } from "@/lib/programs/parser";

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

  const adminPassword = await hash(process.env.ADMIN_PASSWORD ?? "AdminPass123!", 10);
  const agentPassword = await hash(process.env.AGENT_PASSWORD ?? "AgentPass123!", 10);

  await db.user.createMany({
    data: [
      {
        email: (process.env.ADMIN_EMAIL ?? "admin@rehmatedu.local").toLowerCase(),
        name: process.env.ADMIN_NAME ?? "Platform Admin",
        passwordHash: adminPassword,
        role: APP_ROLES.ADMIN
      },
      {
        email: (process.env.AGENT_EMAIL ?? "agent@rehmatedu.local").toLowerCase(),
        name: process.env.AGENT_NAME ?? "Admissions Agent",
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
