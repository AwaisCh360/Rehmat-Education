import type { Program } from "@prisma/client";

import { withProgramFiltersCache, withProgramListCache } from "@/lib/programs/cache";
import { getProgramCatalogSnapshot } from "@/lib/programs/catalog-cache";
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

export async function getPrograms(params: ProgramListParams) {
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const pageSize = Math.min(Math.max(Number(params.pageSize ?? "18") || 18, 1), 50);
  const search = normalizeText(params.search);
  const minPrice = parseOptionalNumber(params.minPrice);
  const maxPrice = parseOptionalNumber(params.maxPrice);
  const university = params.university ? normalizeFilterKey(params.university) : "";
  const programName = params.programName ? normalizeFilterKey(params.programName) : "";
  const degree = params.degree ? normalizeFilterKey(params.degree) : "";
  const language = params.language ? normalizeFilterKey(params.language) : "";
  const campus = params.campus ? normalizeFilterKey(params.campus) : "";
  const quota = params.quota === "available" || params.quota === "full" ? params.quota : "";
  const sort = params.sort === "price-asc" || params.sort === "price-desc" ? params.sort : "updated";

  const cacheKey = JSON.stringify({
    page,
    pageSize,
    search,
    university,
    programName,
    degree,
    language,
    campus,
    quota,
    minPrice: Number.isFinite(minPrice) ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    sort
  });

  return withProgramListCache(cacheKey, async () => {
    const catalog = await getProgramCatalogSnapshot();
    const source =
      sort === "price-asc"
        ? catalog.byPriceAsc
        : sort === "price-desc"
          ? catalog.byPriceDesc
          : catalog.byUpdated;
    const filtered = source.filter((program) =>
      matchesProgram(program, {
        search,
        university,
        programName,
        degree,
        language,
        campus,
        quota,
        minPrice,
        maxPrice
      })
    );
    const total = filtered.length;
    const totalCatalog = source.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(toProgramListItem);

    return {
      items,
      total,
      totalCatalog,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1)
    };
  });
}

export async function getProgramFilters() {
  return withProgramFiltersCache(async () => {
    const catalog = await getProgramCatalogSnapshot();

    return {
      universities: buildFacetOptions(catalog.programs, "universityKey", "universityName"),
      programs: buildFacetOptions(catalog.programs, "programKey", "programName"),
      degrees: buildFacetOptions(catalog.programs, "degreeKey", "programDegree"),
      languages: buildFacetOptions(catalog.programs, "languageKey", "language"),
      campuses: buildFacetOptions(catalog.programs, "campusKey", "campus")
    };
  });
}

function buildFacetOptions<K extends keyof Program>(programs: Program[], valueKey: K, labelKey: K, fallback = "Not specified") {
  const facets = new Map<string, { count: number; labels: string[] }>();

  for (const program of programs) {
    const value = String(program[valueKey] ?? "");

    if (!value) {
      continue;
    }

    const label = typeof program[labelKey] === "string" && program[labelKey] ? String(program[labelKey]) : fallback;
    const current = facets.get(value);

    if (current) {
      current.count += 1;
      current.labels.push(label);
    } else {
      facets.set(value, {
        count: 1,
        labels: [label]
      });
    }
  }

  return [...facets.entries()]
    .map(([value, facet]) => ({
      value,
      label: getRepresentativeValue(facet.labels) ?? fallback,
      count: facet.count
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function getProgramById(id: string) {
  const catalog = await getProgramCatalogSnapshot();
  return catalog.byId.get(id) ?? null;
}

export async function getProgramsByIds(ids: string[]) {
  if (!ids.length) {
    return [];
  }

  const catalog = await getProgramCatalogSnapshot();
  return ids.map((id) => catalog.byId.get(id)).filter((row): row is Program => Boolean(row));
}

type ProgramMatchCriteria = {
  search: string;
  university: string;
  programName: string;
  degree: string;
  language: string;
  campus: string;
  quota: "" | "available" | "full";
  minPrice: number | null;
  maxPrice: number | null;
};

function matchesProgram(program: Program, criteria: ProgramMatchCriteria) {
  if (criteria.university && program.universityKey !== criteria.university) return false;
  if (criteria.programName && program.programKey !== criteria.programName) return false;
  if (criteria.degree && program.degreeKey !== criteria.degree) return false;
  if (criteria.language && program.languageKey !== criteria.language) return false;
  if (criteria.campus && program.campusKey !== criteria.campus) return false;
  if (criteria.quota === "available" && program.quotaFull) return false;
  if (criteria.quota === "full" && !program.quotaFull) return false;
  if (criteria.search && !program.searchText.includes(criteria.search)) return false;

  if (Number.isFinite(criteria.minPrice) || Number.isFinite(criteria.maxPrice)) {
    if (typeof program.discountedTuitionFee !== "number") return false;
    if (Number.isFinite(criteria.minPrice) && program.discountedTuitionFee < (criteria.minPrice ?? 0)) return false;
    if (Number.isFinite(criteria.maxPrice) && program.discountedTuitionFee > (criteria.maxPrice ?? 0)) return false;
  }

  return true;
}

function parseOptionalNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toProgramListItem(program: Program): ProgramListItem {
  return {
    id: program.id,
    universityName: program.universityName,
    programName: program.programName,
    universityNameCn: program.universityNameCn,
    programNameCn: program.programNameCn,
    programDegree: program.programDegree,
    language: program.language,
    campus: program.campus,
    discountedTuitionFee: program.discountedTuitionFee,
    tuitionFee: program.tuitionFee,
    cashPaymentFee: program.cashPaymentFee,
    depositPrice: program.depositPrice,
    prepSchoolFee: program.prepSchoolFee,
    academicYear: program.academicYear,
    semester: program.semester,
    quotaFull: program.quotaFull,
    currencyType: program.currencyType
  };
}
