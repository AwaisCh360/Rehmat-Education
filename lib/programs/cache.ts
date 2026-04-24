import { revalidateTag, unstable_cache } from "next/cache";

export const PROGRAM_FILTERS_CACHE_TAG = "program-filter-options";
export const PROGRAM_TOTAL_COUNT_CACHE_TAG = "program-total-count";

export async function withProgramFiltersCache<T>(loader: () => Promise<T>) {
  try {
    return await unstable_cache(loader, [PROGRAM_FILTERS_CACHE_TAG], {
      revalidate: 300,
      tags: [PROGRAM_FILTERS_CACHE_TAG]
    })();
  } catch {
    return await loader();
  }
}

export function revalidateProgramFiltersCache() {
  revalidateTag(PROGRAM_FILTERS_CACHE_TAG);
}

export async function withProgramTotalCountCache(loader: () => Promise<number>) {
  try {
    return await unstable_cache(loader, [PROGRAM_TOTAL_COUNT_CACHE_TAG], {
      revalidate: 120,
      tags: [PROGRAM_TOTAL_COUNT_CACHE_TAG]
    })();
  } catch {
    return await loader();
  }
}

export function revalidateProgramCatalogCache() {
  revalidateTag(PROGRAM_FILTERS_CACHE_TAG);
  revalidateTag(PROGRAM_TOTAL_COUNT_CACHE_TAG);
}
