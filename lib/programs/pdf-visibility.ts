import { db } from "@/lib/db";

export type PdfVisibilitySettings = {
  showUniversity: boolean;
  showProgram: boolean;
  showDegree: boolean;
  showLanguage: boolean;
  showCampus: boolean;
  showAcademicYear: boolean;
  showSemester: boolean;
  showQuotaStatus: boolean;
  showCurrency: boolean;
  showTuitionFee: boolean;
  showDiscountedFee: boolean;
  showPrepSchoolFee: boolean;
  showCashPaymentFee: boolean;
  showDepositPrice: boolean;
};

const SETTINGS_KEY = "agent-pdf-visibility";

export const defaultPdfVisibilitySettings: PdfVisibilitySettings = {
  showUniversity: true,
  showProgram: true,
  showDegree: true,
  showLanguage: true,
  showCampus: true,
  showAcademicYear: true,
  showSemester: true,
  showQuotaStatus: true,
  showCurrency: true,
  showTuitionFee: true,
  showDiscountedFee: true,
  showPrepSchoolFee: true,
  showCashPaymentFee: true,
  showDepositPrice: true
};

type AppSettingDelegate = {
  findUnique: (args: unknown) => Promise<{ valueJson: string } | null>;
  upsert: (args: unknown) => Promise<unknown>;
};

export async function getPdfVisibilitySettings() {
  const appSetting = (db as unknown as { appSetting?: AppSettingDelegate }).appSetting;

  if (!appSetting) {
    return defaultPdfVisibilitySettings;
  }

  const setting = await appSetting.findUnique({
    where: {
      key: SETTINGS_KEY
    }
  });

  if (!setting) {
    return defaultPdfVisibilitySettings;
  }

  return normalizePdfVisibilitySettings(setting.valueJson);
}

export async function setPdfVisibilitySettings(nextSettings: PdfVisibilitySettings) {
  const normalized = {
    ...defaultPdfVisibilitySettings,
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

function normalizePdfVisibilitySettings(valueJson: string) {
  try {
    const parsed = JSON.parse(valueJson) as Partial<PdfVisibilitySettings>;

    return {
      showUniversity: parsed.showUniversity ?? defaultPdfVisibilitySettings.showUniversity,
      showProgram: parsed.showProgram ?? defaultPdfVisibilitySettings.showProgram,
      showDegree: parsed.showDegree ?? defaultPdfVisibilitySettings.showDegree,
      showLanguage: parsed.showLanguage ?? defaultPdfVisibilitySettings.showLanguage,
      showCampus: parsed.showCampus ?? defaultPdfVisibilitySettings.showCampus,
      showAcademicYear: parsed.showAcademicYear ?? defaultPdfVisibilitySettings.showAcademicYear,
      showSemester: parsed.showSemester ?? defaultPdfVisibilitySettings.showSemester,
      showQuotaStatus: parsed.showQuotaStatus ?? defaultPdfVisibilitySettings.showQuotaStatus,
      showCurrency: parsed.showCurrency ?? defaultPdfVisibilitySettings.showCurrency,
      showTuitionFee: parsed.showTuitionFee ?? defaultPdfVisibilitySettings.showTuitionFee,
      showDiscountedFee: parsed.showDiscountedFee ?? defaultPdfVisibilitySettings.showDiscountedFee,
      showPrepSchoolFee: parsed.showPrepSchoolFee ?? defaultPdfVisibilitySettings.showPrepSchoolFee,
      showCashPaymentFee: parsed.showCashPaymentFee ?? defaultPdfVisibilitySettings.showCashPaymentFee,
      showDepositPrice: parsed.showDepositPrice ?? defaultPdfVisibilitySettings.showDepositPrice
    };
  } catch {
    return defaultPdfVisibilitySettings;
  }
}
