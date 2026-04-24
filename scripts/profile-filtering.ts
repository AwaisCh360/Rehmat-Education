import { db } from "@/lib/db";
import { getFilterVisibilitySettings } from "@/lib/programs/filter-visibility";
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

  await timed("db.connectivity SELECT 1", () => db.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`);
  await timed("db.program.count", () => db.program.count());
  await timed("db.program.findMany list page", () =>
    db.program.findMany({
      select: {
        id: true,
        universityName: true,
        programName: true,
        universityNameCn: true,
        programNameCn: true,
        programDegree: true,
        language: true,
        campus: true,
        discountedTuitionFee: true,
        tuitionFee: true,
        cashPaymentFee: true,
        depositPrice: true,
        prepSchoolFee: true,
        academicYear: true,
        semester: true,
        quotaFull: true,
        currencyType: true
      },
      take: 18,
      orderBy: [{ updatedAt: "desc" }]
    })
  );

  await timed("getPrograms default", () => getPrograms({ page: "1", pageSize: "18" }));
  await timed("getPrograms search", () => getPrograms({ search: "engineering", page: "1", pageSize: "18" }));

  await timed("getProgramFilters cold", () => getProgramFilters());
  await timed("getProgramFilters warm", () => getProgramFilters());
  await timed("getFilterVisibilitySettings cold", () => getFilterVisibilitySettings());
  await timed("getFilterVisibilitySettings warm", () => getFilterVisibilitySettings());

  await timed("programs-page flow cold", async () => {
    await Promise.all([
      getPrograms({ page: "1", pageSize: "18" }),
      getProgramFilters(),
      getFilterVisibilitySettings()
    ]);
  });

  await timed("programs-page flow warm", async () => {
    await Promise.all([
      getPrograms({ page: "1", pageSize: "18" }),
      getProgramFilters(),
      getFilterVisibilitySettings()
    ]);
  });

  console.log("Filtering profile done");

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
