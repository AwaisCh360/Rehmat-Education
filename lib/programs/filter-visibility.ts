import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";

export type FilterVisibilitySettings = {
  search: boolean;
  university: boolean;
  programName: boolean;
  degree: boolean;
  language: boolean;
  campus: boolean;
  quota: boolean;
  discountedFeeRange: boolean;
  sort: boolean;
};

const SETTINGS_KEY = "agent-filter-visibility";
const FILTER_VISIBILITY_CACHE_TAG = "agent-filter-visibility";
let memoryVisibilityCache: { value: FilterVisibilitySettings; expiresAt: number } | null = null;

export const defaultFilterVisibilitySettings: FilterVisibilitySettings = {
  search: true,
  university: true,
  programName: true,
  degree: true,
  language: true,
  campus: true,
  quota: true,
  discountedFeeRange: true,
  sort: true
};

export async function getFilterVisibilitySettings() {
  if (memoryVisibilityCache && Date.now() < memoryVisibilityCache.expiresAt) {
    return memoryVisibilityCache.value;
  }

  const loader = async () => {
    const appSetting = (db as unknown as { appSetting?: { findUnique: (args: unknown) => Promise<{ valueJson: string } | null>; upsert: (args: unknown) => Promise<unknown> } }).appSetting;

    if (!appSetting) {
      return defaultFilterVisibilitySettings;
    }

    const setting = await appSetting.findUnique({
      where: {
        key: SETTINGS_KEY
      }
    });

    if (!setting) {
      return defaultFilterVisibilitySettings;
    }

    return normalizeVisibilitySettings(setting.valueJson);
  };

  try {
    const result = await unstable_cache(loader, [FILTER_VISIBILITY_CACHE_TAG], {
      revalidate: 300,
      tags: [FILTER_VISIBILITY_CACHE_TAG]
    })();

    memoryVisibilityCache = {
      value: result,
      expiresAt: Date.now() + 60_000
    };

    return result;
  } catch {
    const result = await loader();
    memoryVisibilityCache = {
      value: result,
      expiresAt: Date.now() + 60_000
    };
    return result;
  }
}

export async function setFilterVisibilitySettings(nextSettings: FilterVisibilitySettings) {
  const normalized = {
    ...defaultFilterVisibilitySettings,
    ...nextSettings
  };

  const appSetting = (db as unknown as { appSetting?: { findUnique: (args: unknown) => Promise<{ valueJson: string } | null>; upsert: (args: unknown) => Promise<unknown> } }).appSetting;

  if (!appSetting) {
    return normalized;
  }

  await appSetting.upsert({
    where: {
      key: SETTINGS_KEY
    },
    create: {
      key: SETTINGS_KEY,
      valueJson: JSON.stringify(normalized)
    },
    update: {
      valueJson: JSON.stringify(normalized)
    }
  });

  try {
    revalidateTag(FILTER_VISIBILITY_CACHE_TAG);
  } catch {
    // No-op in contexts where Next cache is unavailable.
  }

  memoryVisibilityCache = {
    value: normalized,
    expiresAt: Date.now() + 60_000
  };

  return normalized;
}

function normalizeVisibilitySettings(valueJson: string) {
  try {
    const parsed = JSON.parse(valueJson) as Partial<FilterVisibilitySettings>;

    return {
      search: parsed.search ?? defaultFilterVisibilitySettings.search,
      university: parsed.university ?? defaultFilterVisibilitySettings.university,
      programName: parsed.programName ?? defaultFilterVisibilitySettings.programName,
      degree: parsed.degree ?? defaultFilterVisibilitySettings.degree,
      language: parsed.language ?? defaultFilterVisibilitySettings.language,
      campus: parsed.campus ?? defaultFilterVisibilitySettings.campus,
      quota: parsed.quota ?? defaultFilterVisibilitySettings.quota,
      discountedFeeRange: parsed.discountedFeeRange ?? defaultFilterVisibilitySettings.discountedFeeRange,
      sort: parsed.sort ?? defaultFilterVisibilitySettings.sort
    };
  } catch {
    return defaultFilterVisibilitySettings;
  }
}
