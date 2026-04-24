import { revalidateTag, unstable_cache } from "next/cache";

import { clearProgramCatalogSnapshot, PROGRAM_CATALOG_CACHE_TAG } from "@/lib/programs/catalog-cache";

export const PROGRAM_FILTERS_CACHE_TAG = "program-filter-options";
export const PROGRAM_TOTAL_COUNT_CACHE_TAG = "program-total-count";
export const PROGRAM_LIST_CACHE_TAG = "program-list";

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

function getFromMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value as T;
}

function setMemoryCache<T>(key: string, value: T, ttlMs: number) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

function clearMemoryCacheByPrefix(prefix: string) {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

export async function withProgramFiltersCache<T>(loader: () => Promise<T>) {
  const memoryKey = `${PROGRAM_FILTERS_CACHE_TAG}:singleton`;
  const memoryHit = getFromMemoryCache<T>(memoryKey);

  if (memoryHit) {
    return memoryHit;
  }

  try {
    const result = await unstable_cache(loader, [PROGRAM_FILTERS_CACHE_TAG], {
      revalidate: 300,
      tags: [PROGRAM_FILTERS_CACHE_TAG]
    })();

    setMemoryCache(memoryKey, result, 60_000);
    return result;
  } catch {
    const result = await loader();
    setMemoryCache(memoryKey, result, 60_000);
    return result;
  }
}

export function revalidateProgramFiltersCache() {
  safeRevalidateTag(PROGRAM_FILTERS_CACHE_TAG);
  clearMemoryCacheByPrefix(`${PROGRAM_FILTERS_CACHE_TAG}:`);
}

export async function withProgramTotalCountCache(loader: () => Promise<number>) {
  const memoryKey = `${PROGRAM_TOTAL_COUNT_CACHE_TAG}:singleton`;
  const memoryHit = getFromMemoryCache<number>(memoryKey);

  if (memoryHit !== null) {
    return memoryHit;
  }

  try {
    const result = await unstable_cache(loader, [PROGRAM_TOTAL_COUNT_CACHE_TAG], {
      revalidate: 120,
      tags: [PROGRAM_TOTAL_COUNT_CACHE_TAG]
    })();

    setMemoryCache(memoryKey, result, 20_000);
    return result;
  } catch {
    const result = await loader();
    setMemoryCache(memoryKey, result, 20_000);
    return result;
  }
}

export async function withProgramListCache<T>(cacheKey: string, loader: () => Promise<T>) {
  const memoryKey = `${PROGRAM_LIST_CACHE_TAG}:${cacheKey}`;
  const memoryHit = getFromMemoryCache<T>(memoryKey);

  if (memoryHit) {
    return memoryHit;
  }

  try {
    const result = await unstable_cache(loader, [PROGRAM_LIST_CACHE_TAG, cacheKey], {
      revalidate: 60,
      tags: [PROGRAM_LIST_CACHE_TAG]
    })();

    setMemoryCache(memoryKey, result, 15_000);
    return result;
  } catch {
    const result = await loader();
    setMemoryCache(memoryKey, result, 15_000);
    return result;
  }
}

export function revalidateProgramCatalogCache(options: { clearSnapshot?: boolean } = {}) {
  safeRevalidateTag(PROGRAM_CATALOG_CACHE_TAG);
  safeRevalidateTag(PROGRAM_FILTERS_CACHE_TAG);
  safeRevalidateTag(PROGRAM_TOTAL_COUNT_CACHE_TAG);
  safeRevalidateTag(PROGRAM_LIST_CACHE_TAG);

  if (options.clearSnapshot ?? true) {
    clearProgramCatalogSnapshot();
  }
  clearMemoryCacheByPrefix(`${PROGRAM_FILTERS_CACHE_TAG}:`);
  clearMemoryCacheByPrefix(`${PROGRAM_TOTAL_COUNT_CACHE_TAG}:`);
  clearMemoryCacheByPrefix(`${PROGRAM_LIST_CACHE_TAG}:`);
}

function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag);
  } catch {
    // No-op in scripts/tests where the Next.js cache runtime is unavailable.
  }
}
