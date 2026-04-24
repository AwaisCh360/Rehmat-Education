import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { withProgramFiltersCache, withProgramListCache, withProgramTotalCountCache } from "@/lib/programs/cache";
import { getRepresentativeValue, normalizeFilterKey, normalizeText } from "@/lib/programs/normalize";

export type ProgramListParams = {
  search?: string;
  university?: string;
  programName?: string;
  degree?: string;
  language?: string;
  campus?: string;
  quota?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

export type FilterOption = {
  value: string;
  label: string;
  count: number;
};

type ProgramFacetRow = {
  facet: "universities" | "programs" | "degrees" | "languages" | "campuses";
  value: string;
  label: string | null;
  count: number;
};

export type ProgramListItem = {
  id: string;
  universityName: string;
  programName: string;
  universityNameCn: string | null;
  programNameCn: string | null;
  programDegree: string | null;
  language: string | null;
  campus: string | null;
  discountedTuitionFee: number | null;
  tuitionFee: number | null;
  cashPaymentFee: number | null;
  depositPrice: number | null;
  prepSchoolFee: number | null;
  academicYear: string | null;
  semester: string | null;
  quotaFull: boolean;
  currencyType: string | null;
};

const PROGRAM_LIST_SELECT = {
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
} satisfies Prisma.ProgramSelect;

export async function getPrograms(params: ProgramListParams) {
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const pageSize = Math.min(Math.max(Number(params.pageSize ?? "18") || 18, 1), 50);
  const search = normalizeText(params.search);
  const minPrice = params.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;
  const hasAnyFilter = Boolean(
    params.university ||
      params.programName ||
      params.degree ||
      params.language ||
      params.campus ||
      params.quota ||
      search ||
      Number.isFinite(minPrice) ||
      Number.isFinite(maxPrice)
  );

  const where: Prisma.ProgramWhereInput = {
    AND: [
      params.university ? { universityKey: normalizeFilterKey(params.university) } : {},
      params.programName ? { programKey: normalizeFilterKey(params.programName) } : {},
      params.degree ? { degreeKey: normalizeFilterKey(params.degree) } : {},
      params.language ? { languageKey: normalizeFilterKey(params.language) } : {},
      params.campus ? { campusKey: normalizeFilterKey(params.campus) } : {},
      params.quota === "available" ? { quotaFull: false } : {},
      params.quota === "full" ? { quotaFull: true } : {},
      search ? { searchText: { contains: search } } : {},
      Number.isFinite(minPrice) ? { discountedTuitionFee: { gte: minPrice ?? undefined } } : {},
      Number.isFinite(maxPrice) ? { discountedTuitionFee: { lte: maxPrice ?? undefined } } : {}
    ]
  };

  const orderBy =
    params.sort === "price-asc"
      ? [{ discountedTuitionFee: "asc" as const }, { programName: "asc" as const }]
      : params.sort === "price-desc"
        ? [{ discountedTuitionFee: "desc" as const }, { programName: "asc" as const }]
        : [{ updatedAt: "desc" as const }];

  const cacheKey = JSON.stringify({
    page,
    pageSize,
    search,
    university: params.university || "",
    programName: params.programName || "",
    degree: params.degree || "",
    language: params.language || "",
    campus: params.campus || "",
    quota: params.quota || "",
    minPrice: Number.isFinite(minPrice) ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    sort: params.sort || "updated"
  });

  return withProgramListCache(cacheKey, async () => {
    const [items, total] = await Promise.all([
      db.program.findMany({
        select: PROGRAM_LIST_SELECT,
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      hasAnyFilter ? db.program.count({ where }) : withProgramTotalCountCache(() => db.program.count())
    ]);

    return {
      items: items as ProgramListItem[],
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1)
    };
  });
}

export async function getProgramFilters() {
  return withProgramFiltersCache(async () => {
    const rows = await db.$queryRaw<ProgramFacetRow[]>`
      SELECT 'universities'::text AS facet, "universityKey" AS value, MIN("universityName") AS label, COUNT(*)::int AS count
      FROM "Program"
      WHERE "universityKey" <> ''
      GROUP BY "universityKey"

      UNION ALL

      SELECT 'programs'::text AS facet, "programKey" AS value, MIN("programName") AS label, COUNT(*)::int AS count
      FROM "Program"
      WHERE "programKey" <> ''
      GROUP BY "programKey"

      UNION ALL

      SELECT 'degrees'::text AS facet, "degreeKey" AS value, MIN("programDegree") AS label, COUNT(*)::int AS count
      FROM "Program"
      WHERE "degreeKey" <> ''
      GROUP BY "degreeKey"

      UNION ALL

      SELECT 'languages'::text AS facet, "languageKey" AS value, MIN("language") AS label, COUNT(*)::int AS count
      FROM "Program"
      WHERE "languageKey" <> ''
      GROUP BY "languageKey"

      UNION ALL

      SELECT 'campuses'::text AS facet, "campusKey" AS value, MIN("campus") AS label, COUNT(*)::int AS count
      FROM "Program"
      WHERE "campusKey" <> ''
      GROUP BY "campusKey"
    `;

    const grouped = {
      universities: [] as ProgramFacetRow[],
      programs: [] as ProgramFacetRow[],
      degrees: [] as ProgramFacetRow[],
      languages: [] as ProgramFacetRow[],
      campuses: [] as ProgramFacetRow[]
    };

    for (const row of rows) {
      grouped[row.facet].push(row);
    }

    return {
      universities: mapFacetOptions(grouped.universities),
      programs: mapFacetOptions(grouped.programs),
      degrees: mapFacetOptions(grouped.degrees),
      languages: mapFacetOptions(grouped.languages),
      campuses: mapFacetOptions(grouped.campuses)
    };
  });
}

function mapFacetOptions(rows: ProgramFacetRow[], fallback = "Not specified") {
  return rows
    .map((row) => ({
      value: row.value,
      label: getRepresentativeValue([row.label ?? fallback]) ?? fallback,
      count: Number(row.count) || 0
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function getProgramById(id: string) {
  return db.program.findUnique({
    where: { id }
  });
}

export async function getProgramsByIds(ids: string[]) {
  if (!ids.length) {
    return [];
  }

  const rows = await db.program.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });

  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter((row): row is (typeof rows)[number] => Boolean(row));
}
