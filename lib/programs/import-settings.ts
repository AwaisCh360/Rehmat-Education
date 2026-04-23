import { db } from "@/lib/db";

export type ImportSettings = {
  defaultMode: "merge" | "replace";
  sourceUrl: string;
};

const SETTINGS_KEY = "agent-import-settings";

export const defaultImportSettings: ImportSettings = {
  defaultMode: "replace",
  sourceUrl: "https://partner.unitededucation.com/Manage/test?termid=a1ZP2000004F0JxMAK"
};

type AppSettingDelegate = {
  findUnique: (args: unknown) => Promise<{ valueJson: string } | null>;
  upsert: (args: unknown) => Promise<unknown>;
};

export async function getImportSettings() {
  const appSetting = (db as unknown as { appSetting?: AppSettingDelegate }).appSetting;

  if (!appSetting) {
    return defaultImportSettings;
  }

  const setting = await appSetting.findUnique({
    where: {
      key: SETTINGS_KEY
    }
  });

  if (!setting) {
    return defaultImportSettings;
  }

  return normalizeImportSettings(setting.valueJson);
}

export async function setImportSettings(nextSettings: ImportSettings) {
  const normalized = {
    ...defaultImportSettings,
    ...nextSettings
  };

  const appSetting = (db as unknown as { appSetting?: AppSettingDelegate }).appSetting;

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

function normalizeImportSettings(valueJson: string) {
  try {
    const parsed = JSON.parse(valueJson) as Partial<ImportSettings>;

    return {
      defaultMode: parsed.defaultMode === "replace" ? "replace" : "merge",
      sourceUrl: typeof parsed.sourceUrl === "string" && parsed.sourceUrl.trim().length > 0 ? parsed.sourceUrl.trim() : defaultImportSettings.sourceUrl
    };
  } catch {
    return defaultImportSettings;
  }
}
