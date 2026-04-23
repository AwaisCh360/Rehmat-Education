import { z } from "zod";

import {
  buildSearchText,
  normalizeDisplayValue,
  normalizeFilterKey,
  normalizeOptionalDisplayValue,
  normalizeText,
  toNullableNumber
} from "@/lib/programs/normalize";

const rawProgramSchema = z.object({
  Id: z.string().min(1),
  University_Name__c: z.string().min(1),
  Program_Degree__c: z.string().nullable().optional(),
  Program_Name__c: z.string().min(1),
  University_Name__cn: z.string().nullable().optional(),
  Program_Name__cn: z.string().nullable().optional(),
  Alternative_Program_Name__c: z.string().nullable().optional(),
  CurrencyType__c: z.string().nullable().optional(),
  Tuition_Fee__c: z.string().nullable().optional(),
  Discounted_Tuition_Fee__c: z.string().nullable().optional(),
  Cash_Payment_Fee__c: z.string().nullable().optional(),
  Prep_School_Fee__c: z.string().nullable().optional(),
  Deposit_Price__c: z.string().nullable().optional(),
  Language__c: z.string().nullable().optional(),
  Campus__c: z.string().nullable().optional(),
  Quota_Full__c: z.boolean().nullable().optional(),
  Program__c: z.string().nullable().optional(),
  Term_Settings__c: z.string().nullable().optional(),
  Semester__c: z.string().nullable().optional(),
  University_Id__c: z.string().nullable().optional(),
  Academic_Year__c: z.string().nullable().optional(),
  unilogo: z.string().nullable().optional()
});

const programPayloadSchema = z.union([
  z.array(rawProgramSchema),
  z.object({
    records: z.array(rawProgramSchema),
    totalSize: z.number().optional(),
    done: z.boolean().optional(),
    nextRecordsUrl: z.string().nullable().optional()
  })
]);

export type RawProgramRecord = z.infer<typeof rawProgramSchema>;

export function extractProgramRecords(payload: unknown) {
  const parsed = programPayloadSchema.parse(payload);
  return Array.isArray(parsed) ? parsed : parsed.records;
}

export function parseProgramJson(input: string) {
  const parsed = JSON.parse(input) as unknown;
  return extractProgramRecords(parsed);
}

export function validateUniqueIds(records: RawProgramRecord[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const record of records) {
    if (seen.has(record.Id)) {
      duplicates.add(record.Id);
    }
    seen.add(record.Id);
  }

  return {
    ok: duplicates.size === 0,
    duplicates: [...duplicates]
  };
}

export function toProgramPersistence(record: RawProgramRecord) {
  const universityDisplay = normalizeDisplayValue(record.University_Name__c);
  const programDisplay = normalizeDisplayValue(record.Program_Name__c);
  const degreeDisplay = normalizeDisplayValue(record.Program_Degree__c);
  const languageDisplay = normalizeDisplayValue(record.Language__c);
  const campusDisplay = normalizeDisplayValue(record.Campus__c);

  return {
    id: record.Id,
    universityName: universityDisplay,
    programDegree: normalizeOptionalDisplayValue(record.Program_Degree__c),
    programName: programDisplay,
    universityNameCn: normalizeOptionalDisplayValue(record.University_Name__cn),
    programNameCn: normalizeOptionalDisplayValue(record.Program_Name__cn),
    alternativeProgramName: normalizeOptionalDisplayValue(record.Alternative_Program_Name__c),
    currencyType: normalizeOptionalDisplayValue(record.CurrencyType__c),
    tuitionFeeOriginal: record.Tuition_Fee__c ?? null,
    discountedTuitionFeeOriginal: record.Discounted_Tuition_Fee__c ?? null,
    cashPaymentFeeOriginal: record.Cash_Payment_Fee__c ?? null,
    prepSchoolFeeOriginal: record.Prep_School_Fee__c ?? null,
    depositPriceOriginal: record.Deposit_Price__c ?? null,
    tuitionFee: toNullableNumber(record.Tuition_Fee__c),
    discountedTuitionFee: toNullableNumber(record.Discounted_Tuition_Fee__c),
    cashPaymentFee: toNullableNumber(record.Cash_Payment_Fee__c),
    prepSchoolFee: toNullableNumber(record.Prep_School_Fee__c),
    depositPrice: toNullableNumber(record.Deposit_Price__c),
    language: normalizeOptionalDisplayValue(record.Language__c),
    campus: normalizeOptionalDisplayValue(record.Campus__c),
    quotaFull: Boolean(record.Quota_Full__c),
    programRef: record.Program__c ?? null,
    termSettings: record.Term_Settings__c ?? null,
    semester: record.Semester__c ?? null,
    universityId: record.University_Id__c ?? null,
    academicYear: record.Academic_Year__c ?? null,
    unilogo: record.unilogo ?? null,
    universityKey: normalizeFilterKey(universityDisplay),
    programKey: normalizeFilterKey(programDisplay),
    degreeKey: normalizeFilterKey(degreeDisplay || "not-specified"),
    languageKey: normalizeFilterKey(languageDisplay || "not-specified"),
    campusKey: normalizeFilterKey(campusDisplay || "not-specified"),
    searchText: buildSearchText([
      universityDisplay,
      programDisplay,
      record.Alternative_Program_Name__c ?? "",
      record.Program_Name__cn ?? "",
      record.University_Name__cn ?? ""
    ])
  };
}

export function toComparableProgram(record: RawProgramRecord) {
  return JSON.stringify(toProgramPersistence(record));
}

export function toComparablePersistedProgram(record: ReturnType<typeof toProgramPersistence>) {
  return JSON.stringify(record);
}

export function matchesSearch(record: { searchText: string }, search: string) {
  return record.searchText.includes(normalizeText(search));
}
