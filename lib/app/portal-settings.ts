import { db } from "@/lib/db";

export type PortalSettings = {
  appName: string;
  slogan: string;
  logoDataUrl: string | null;
  signupEnabled: boolean;
  defaultProgramLayout: "table" | "card";
};

const SETTINGS_KEY = "portal-settings";

export const defaultPortalSettings: PortalSettings = {
  appName: "Student On Board",
  slogan: "Plan Today, Study Tomorrow, Succeed Forever",
  logoDataUrl: null,
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
      appName: typeof parsed.appName === "string" && parsed.appName.trim().length > 0 ? parsed.appName.trim() : defaultPortalSettings.appName,
      slogan: typeof parsed.slogan === "string" && parsed.slogan.trim().length > 0 ? parsed.slogan.trim() : defaultPortalSettings.slogan,
      logoDataUrl: typeof parsed.logoDataUrl === "string" && parsed.logoDataUrl.trim().length > 0 ? parsed.logoDataUrl : null,
      signupEnabled: parsed.signupEnabled ?? defaultPortalSettings.signupEnabled,
      defaultProgramLayout: parsed.defaultProgramLayout === "card" ? "card" : "table"
    };
  } catch {
    return defaultPortalSettings;
  }
}