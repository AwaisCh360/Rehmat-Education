import { db } from "@/lib/db";

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
