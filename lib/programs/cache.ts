import { revalidateTag, unstable_cache } from "next/cache";

export const PROGRAM_FILTERS_CACHE_TAG = "program-filter-options";

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
