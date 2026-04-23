import { z } from "zod";

import { buildSearchText, normalizeDisplayValue, normalizeFilterKey, toNullableNumber } from "@/lib/programs/normalize";

export const programFormSchema = z.object({
  id: z.string().min(1, "Program Id is required"),
  universityName: z.string().min(1, "University name is required"),
  programDegree: z.string().optional().nullable(),
  programName: z.string().min(1, "Program name is required"),
  universityNameCn: z.string().optional().nullable(),
  programNameCn: z.string().optional().nullable(),
  alternativeProgramName: z.string().optional().nullable(),
  currencyType: z.string().optional().nullable(),
  tuitionFeeOriginal: z.string().optional().nullable(),
  discountedTuitionFeeOriginal: z.string().optional().nullable(),
  cashPaymentFeeOriginal: z.string().optional().nullable(),
  prepSchoolFeeOriginal: z.string().optional().nullable(),
  depositPriceOriginal: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  campus: z.string().optional().nullable(),
  quotaFull: z.boolean().default(false),
  programRef: z.string().optional().nullable(),
  termSettings: z.string().optional().nullable(),
  semester: z.string().optional().nullable(),
  universityId: z.string().optional().nullable(),
  academicYear: z.string().optional().nullable(),
  unilogo: z.string().optional().nullable()
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;

export function toProgramMutationInput(values: ProgramFormValues) {
  const universityDisplay = normalizeDisplayValue(values.universityName);
  const programDisplay = normalizeDisplayValue(values.programName);
  const degreeDisplay = normalizeDisplayValue(values.programDegree);
  const languageDisplay = normalizeDisplayValue(values.language);
  const campusDisplay = normalizeDisplayValue(values.campus);

  return {
    id: values.id,
    universityName: universityDisplay,
    programDegree: values.programDegree ? normalizeDisplayValue(values.programDegree) : null,
    programName: programDisplay,
    universityNameCn: values.universityNameCn || null,
    programNameCn: values.programNameCn || null,
    alternativeProgramName: values.alternativeProgramName || null,
    currencyType: values.currencyType || null,
    tuitionFeeOriginal: values.tuitionFeeOriginal || null,
    discountedTuitionFeeOriginal: values.discountedTuitionFeeOriginal || null,
    cashPaymentFeeOriginal: values.cashPaymentFeeOriginal || null,
    prepSchoolFeeOriginal: values.prepSchoolFeeOriginal || null,
    depositPriceOriginal: values.depositPriceOriginal || null,
    tuitionFee: toNullableNumber(values.tuitionFeeOriginal),
    discountedTuitionFee: toNullableNumber(values.discountedTuitionFeeOriginal),
    cashPaymentFee: toNullableNumber(values.cashPaymentFeeOriginal),
    prepSchoolFee: toNullableNumber(values.prepSchoolFeeOriginal),
    depositPrice: toNullableNumber(values.depositPriceOriginal),
    language: values.language ? normalizeDisplayValue(values.language) : null,
    campus: values.campus ? normalizeDisplayValue(values.campus) : null,
    quotaFull: values.quotaFull,
    programRef: values.programRef || null,
    termSettings: values.termSettings || null,
    semester: values.semester || null,
    universityId: values.universityId || null,
    academicYear: values.academicYear || null,
    unilogo: values.unilogo || null,
    universityKey: normalizeFilterKey(universityDisplay),
    programKey: normalizeFilterKey(programDisplay),
    degreeKey: normalizeFilterKey(degreeDisplay || "not-specified"),
    languageKey: normalizeFilterKey(languageDisplay || "not-specified"),
    campusKey: normalizeFilterKey(campusDisplay || "not-specified"),
    searchText: buildSearchText([universityDisplay, programDisplay, values.alternativeProgramName, values.programNameCn, values.universityNameCn])
  };
}

export const importCommitSchema = z.object({
  sessionId: z.string().min(1),
  mode: z.enum(["merge", "replace"])
});
