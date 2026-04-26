import { db } from "@/lib/db";

export type PortalSettings = {
  signupEnabled: boolean;
  defaultProgramLayout: "table" | "card";
};

const SETTINGS_KEY = "portal-settings";

export const defaultPortalSettings: PortalSettings = {
  signupEnabled: true,
  defaultProgramLayout: "table"
};

type AppSettingDelegate = {
  findUnique: (args: unknown) => Promise<{ valueJson: string } | null>;
  upsert: (args: unknown) => Promise<unknown>;
};

export async function getPortalSettings(): Promise<PortalSettings> {
  const appSetting = (db as unknown as { appSetting?: AppSettingDelegate }).appSetting;

  if (!appSetting) {
    return defaultPortalSettings;
  }

  const setting = await appSetting.findUnique({
    where: {
      key: SETTINGS_KEY
    }
  });

  if (!setting) {
    return defaultPortalSettings;
  }

  return normalizePortalSettings(setting.valueJson);
}

export async function setPortalSettings(nextSettings: PortalSettings): Promise<PortalSettings> {
  const normalized: PortalSettings = {
    ...defaultPortalSettings,
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

function normalizePortalSettings(valueJson: string): PortalSettings {
  try {
    const parsed = JSON.parse(valueJson) as Partial<PortalSettings>;

    return {
      signupEnabled: parsed.signupEnabled ?? defaultPortalSettings.signupEnabled,
      defaultProgramLayout: parsed.defaultProgramLayout === "card" ? "card" : "table"
    };
  } catch {
    return defaultPortalSettings;
  }
}