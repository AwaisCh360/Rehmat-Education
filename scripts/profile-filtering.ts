import { getProgramFilters, getPrograms } from "@/lib/programs/query";

async function timed<T>(label: string, fn: () => Promise<T>) {
  const startedAt = Date.now();
  const result = await fn();
  const elapsedMs = Date.now() - startedAt;
  console.log(`${label}: ${elapsedMs}ms`);
  return result;
}

async function main() {
  console.log("Filtering profile start");

  await timed("getPrograms default", () => getPrograms({ page: "1", pageSize: "18" }));
  await timed("getPrograms search", () => getPrograms({ search: "engineering", page: "1", pageSize: "18" }));

  await timed("getProgramFilters cold", () => getProgramFilters());
  await timed("getProgramFilters warm", () => getProgramFilters());

  console.log("Filtering profile done");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
