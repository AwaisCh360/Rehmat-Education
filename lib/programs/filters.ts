import type { PersistedFilters } from "@/lib/programs/filter-store";

type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function getValue(input: SearchParamsInput, key: keyof PersistedFilters) {
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? "";
  }

  const value = input[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function getFiltersFromSearchParams(input: SearchParamsInput): PersistedFilters {
  return {
    search: getValue(input, "search"),
    university: getValue(input, "university"),
    programName: getValue(input, "programName"),
    degree: getValue(input, "degree"),
    language: getValue(input, "language"),
    campus: getValue(input, "campus"),
    quota: getValue(input, "quota"),
    minPrice: getValue(input, "minPrice"),
    maxPrice: getValue(input, "maxPrice"),
    sort: getValue(input, "sort") || "updated"
  };
}

export function toSingleSearchParamRecord(input: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
}
