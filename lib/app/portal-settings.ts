import { db } from "@/lib/db";

export type PortalSettings = {
  appName: string;
  slogan: string;
  logoDataUrl: string | null;
  heroSlides: string[];
  signupEnabled: boolean;
  defaultProgramLayout: "table" | "card";
  programDisplay: {
    table: {
      university: boolean;
      programName: boolean;
      degree: boolean;
      language: boolean;
      campus: boolean;
      discountedFee: boolean;
      originalFee: boolean;
      cashFee: boolean;
      depositFee: boolean;
      prepSchoolFee: boolean;
      academicYear: boolean;
      semester: boolean;
      status: boolean;
    };
    card: {
      university: boolean;
      programName: boolean;
      degree: boolean;
      language: boolean;
      campus: boolean;
      status: boolean;
      originalFee: boolean;
      discountedFee: boolean;
      cashFee: boolean;
      depositFee: boolean;
      prepSchoolFee: boolean;
      academicYear: boolean;
    };
  };
};

const SETTINGS_KEY = "portal-settings";

export const defaultPortalSettings: PortalSettings = {
  appName: "Student On Board",
  slogan: "Plan Today, Study Tomorrow, Succeed Forever",
  logoDataUrl: null,
  heroSlides: [],
  signupEnabled: true,
  defaultProgramLayout: "table",
  programDisplay: {
    table: {
      university: true,
      programName: true,
      degree: true,
      language: true,
      campus: true,
      discountedFee: true,
      originalFee: true,
      cashFee: true,
      depositFee: true,
      prepSchoolFee: true,
      academicYear: true,
      semester: true,
      status: true
    },
    card: {
      university: true,
      programName: true,
      degree: true,
      language: true,
      campus: true,
      status: true,
      originalFee: true,
      discountedFee: true,
      cashFee: true,
      depositFee: true,
      prepSchoolFee: true,
      academicYear: true
    }
  }
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
      heroSlides: Array.isArray(parsed.heroSlides)
        ? parsed.heroSlides.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : defaultPortalSettings.heroSlides,
      signupEnabled: parsed.signupEnabled ?? defaultPortalSettings.signupEnabled,
      defaultProgramLayout: parsed.defaultProgramLayout === "card" ? "card" : "table",
      programDisplay: {
        table: {
          university: parsed.programDisplay?.table?.university ?? defaultPortalSettings.programDisplay.table.university,
          programName: parsed.programDisplay?.table?.programName ?? defaultPortalSettings.programDisplay.table.programName,
          degree: parsed.programDisplay?.table?.degree ?? defaultPortalSettings.programDisplay.table.degree,
          language: parsed.programDisplay?.table?.language ?? defaultPortalSettings.programDisplay.table.language,
          campus: parsed.programDisplay?.table?.campus ?? defaultPortalSettings.programDisplay.table.campus,
          discountedFee: parsed.programDisplay?.table?.discountedFee ?? defaultPortalSettings.programDisplay.table.discountedFee,
          originalFee: parsed.programDisplay?.table?.originalFee ?? defaultPortalSettings.programDisplay.table.originalFee,
          cashFee: parsed.programDisplay?.table?.cashFee ?? defaultPortalSettings.programDisplay.table.cashFee,
          depositFee: parsed.programDisplay?.table?.depositFee ?? defaultPortalSettings.programDisplay.table.depositFee,
          prepSchoolFee: parsed.programDisplay?.table?.prepSchoolFee ?? defaultPortalSettings.programDisplay.table.prepSchoolFee,
          academicYear: parsed.programDisplay?.table?.academicYear ?? defaultPortalSettings.programDisplay.table.academicYear,
          semester: parsed.programDisplay?.table?.semester ?? defaultPortalSettings.programDisplay.table.semester,
          status: parsed.programDisplay?.table?.status ?? defaultPortalSettings.programDisplay.table.status
        },
        card: {
          university: parsed.programDisplay?.card?.university ?? defaultPortalSettings.programDisplay.card.university,
          programName: parsed.programDisplay?.card?.programName ?? defaultPortalSettings.programDisplay.card.programName,
          degree: parsed.programDisplay?.card?.degree ?? defaultPortalSettings.programDisplay.card.degree,
          language: parsed.programDisplay?.card?.language ?? defaultPortalSettings.programDisplay.card.language,
          campus: parsed.programDisplay?.card?.campus ?? defaultPortalSettings.programDisplay.card.campus,
          status: parsed.programDisplay?.card?.status ?? defaultPortalSettings.programDisplay.card.status,
          originalFee: parsed.programDisplay?.card?.originalFee ?? defaultPortalSettings.programDisplay.card.originalFee,
          discountedFee: parsed.programDisplay?.card?.discountedFee ?? defaultPortalSettings.programDisplay.card.discountedFee,
          cashFee: parsed.programDisplay?.card?.cashFee ?? defaultPortalSettings.programDisplay.card.cashFee,
          depositFee: parsed.programDisplay?.card?.depositFee ?? defaultPortalSettings.programDisplay.card.depositFee,
          prepSchoolFee: parsed.programDisplay?.card?.prepSchoolFee ?? defaultPortalSettings.programDisplay.card.prepSchoolFee,
          academicYear: parsed.programDisplay?.card?.academicYear ?? defaultPortalSettings.programDisplay.card.academicYear
        }
      }
    };
  } catch {
    return defaultPortalSettings;
  }
}