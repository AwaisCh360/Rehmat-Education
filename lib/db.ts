import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getPrismaDatabaseUrl() {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    return undefined;
  }

  try {
    const url = new URL(raw);
    const isSupabasePooler = url.hostname.endsWith(".pooler.supabase.com");

    // In serverless, use Supabase transaction pooler and low connection concurrency.
    if (isSupabasePooler) {
      if (url.port === "5432") {
        url.port = "6543";
      }
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT ?? "3");
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", process.env.PRISMA_POOL_TIMEOUT ?? "10");
      }
    }

    return url.toString();
  } catch {
    return raw;
  }
}

export const db =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getPrismaDatabaseUrl()
      }
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
