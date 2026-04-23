import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { withProgramFiltersCache } from "@/lib/programs/cache";
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

  const [items, total] = await Promise.all([
    db.program.findMany({
      select: PROGRAM_LIST_SELECT,
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.program.count({ where })
  ]);

  return {
    items: items as ProgramListItem[],
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1)
  };
}

export async function getProgramFilters() {
  return withProgramFiltersCache(async () => {
    const rows = await db.program.findMany({
      select: {
        universityKey: true,
        universityName: true,
        programKey: true,
        programName: true,
        degreeKey: true,
        programDegree: true,
        languageKey: true,
        language: true,
        campusKey: true,
        campus: true
      }
    });

    return {
      universities: buildOptions(rows, "universityKey", "universityName"),
      programs: buildOptions(rows, "programKey", "programName"),
      degrees: buildOptions(rows, "degreeKey", "programDegree", "Not specified"),
      languages: buildOptions(rows, "languageKey", "language", "Not specified"),
      campuses: buildOptions(rows, "campusKey", "campus", "Not specified")
    };
  });
}

function buildOptions<T extends Record<string, string | null>>(rows: T[], keyField: keyof T, valueField: keyof T, fallback = "Not specified") {
  const grouped = new Map<string, string[]>();

  for (const row of rows) {
    const key = String(row[keyField] ?? "");
    const value = row[valueField] ? String(row[valueField]) : fallback;

    if (!key) {
      continue;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key)?.push(value);
  }

  return [...grouped.entries()]
    .map(([value, labels]) => ({
      value,
      label: getRepresentativeValue(labels) ?? fallback,
      count: labels.length
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
