import { readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";
import { extractProgramRecords, toProgramPersistence } from "@/lib/programs/parser";

async function main() {
  const datasetPath = path.join(process.cwd(), "programs.json");
  const raw = await readFile(datasetPath, "utf8");
  const payload = JSON.parse(raw) as unknown;
  const records = extractProgramRecords(payload);
  const programs = records.map(toProgramPersistence);

  await db.$transaction(async (tx) => {
    await tx.program.deleteMany();
    await tx.program.createMany({
      data: programs
    });
  });

  console.log(`Imported ${programs.length} programs into the database from programs.json.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
