import { db } from "@/lib/db";
import {
  extractProgramRecords,
  type RawProgramRecord,
  toComparablePersistedProgram,
  toComparableProgram,
  toProgramPersistence,
  validateUniqueIds
} from "@/lib/programs/parser";

export type ImportDiff = {
  created: number;
  changed: number;
  unchanged: number;
  deleted: number;
  preview: {
    created: RawProgramRecord[];
    changed: RawProgramRecord[];
    deleted: string[];
  };
};

export function parseImportPayload(content: string) {
  const payload = JSON.parse(content) as unknown;
  const records = extractProgramRecords(payload);
  const uniqueValidation = validateUniqueIds(records);

  if (!uniqueValidation.ok) {
    throw new Error(`Duplicate Id values found: ${uniqueValidation.duplicates.slice(0, 10).join(", ")}`);
  }

  return records;
}

export async function buildImportDiff(records: RawProgramRecord[]): Promise<ImportDiff> {
  const existing = await db.program.findMany();
  const existingMap = new Map(
    existing.map((program) => [
      program.id,
      toComparablePersistedProgram({
        id: program.id,
        universityName: program.universityName,
        programDegree: program.programDegree,
        programName: program.programName,
        universityNameCn: program.universityNameCn,
        programNameCn: program.programNameCn,
        alternativeProgramName: program.alternativeProgramName,
        currencyType: program.currencyType,
        tuitionFeeOriginal: program.tuitionFeeOriginal,
        discountedTuitionFeeOriginal: program.discountedTuitionFeeOriginal,
        cashPaymentFeeOriginal: program.cashPaymentFeeOriginal,
        prepSchoolFeeOriginal: program.prepSchoolFeeOriginal,
        depositPriceOriginal: program.depositPriceOriginal,
        tuitionFee: program.tuitionFee,
        discountedTuitionFee: program.discountedTuitionFee,
        cashPaymentFee: program.cashPaymentFee,
        prepSchoolFee: program.prepSchoolFee,
        depositPrice: program.depositPrice,
        language: program.language,
        campus: program.campus,
        quotaFull: program.quotaFull,
        programRef: program.programRef,
        termSettings: program.termSettings,
        semester: program.semester,
        universityId: program.universityId,
        academicYear: program.academicYear,
        unilogo: program.unilogo,
        universityKey: program.universityKey,
        programKey: program.programKey,
        degreeKey: program.degreeKey,
        languageKey: program.languageKey,
        campusKey: program.campusKey,
        searchText: program.searchText
      })
    ])
  );
  const incomingMap = new Map(records.map((record) => [record.Id, record]));

  const created: RawProgramRecord[] = [];
  const changed: RawProgramRecord[] = [];
  let unchanged = 0;

  for (const record of records) {
    const current = existingMap.get(record.Id);

    if (!current) {
      created.push(record);
      continue;
    }

    if (current !== toComparableProgram(record)) {
      changed.push(record);
    } else {
      unchanged += 1;
    }
  }

  const deleted = existing.filter((program) => !incomingMap.has(program.id)).map((program) => program.id);

  return {
    created: created.length,
    changed: changed.length,
    unchanged,
    deleted: deleted.length,
    preview: {
      created: created.slice(0, 10),
      changed: changed.slice(0, 10),
      deleted: deleted.slice(0, 10)
    }
  };
}

export async function commitImport(records: RawProgramRecord[], mode: "merge" | "replace") {
  const normalized = records.map(toProgramPersistence);

  if (mode === "replace") {
    await db.$transaction([
      db.program.deleteMany(),
      db.program.createMany({
        data: normalized
      })
    ]);
    return;
  }

  const chunkSize = 100;

  for (let index = 0; index < normalized.length; index += chunkSize) {
    const chunk = normalized.slice(index, index + chunkSize);

    await Promise.all(
      chunk.map((record) =>
        db.program.upsert({
          where: { id: record.id },
          create: record,
          update: record
        })
      )
    );
  }
}

export async function getImportSession(sessionId: string) {
  return db.importSession.findUnique({
    where: {
      id: sessionId
    }
  });
}
