import { db } from "@/lib/db";

function describeDatabaseUrl() {
  const raw = process.env.DATABASE_URL ?? "";

  if (!raw) {
    return "DATABASE_URL is missing";
  }

  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.hostname}:${url.port || "default"}`;
  } catch {
    return "DATABASE_URL is set but could not be parsed";
  }
}

async function main() {
  console.log("Testing Supabase connection...");
  console.log(`Target: ${describeDatabaseUrl()}`);

  const startedAt = Date.now();

  const result = await db.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
  const elapsedMs = Date.now() - startedAt;

  const value = result?.[0]?.ok;

  if (value !== 1) {
    throw new Error("Unexpected response from database.");
  }

  console.log(`Connection successful in ${elapsedMs}ms.`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Connection failed:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
