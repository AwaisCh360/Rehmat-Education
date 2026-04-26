import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Program } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { extractProgramRecords, type RawProgramRecord, toProgramPersistence } from "@/lib/programs/parser";

export const PROGRAM_CATALOG_CACHE_TAG = "program-catalog-snapshot";

type SerializableProgram = Omit<Program, "createdAt" | "updatedAt"> & {
  createdAt: Date | string;
  updatedAt: Date | string;
};

type ProgramCatalogSnapshot = {
  programs: Program[];
  byId: Map<string, Program>;
  byUpdated: Program[];
  byPriceAsc: Program[];
  byPriceDesc: Program[];
};

const CATALOG_MEMORY_TTL_MS = 5 * 60_000;

let memoryCatalog: { value: ProgramCatalogSnapshot; expiresAt: number } | null = null;
let loadingCatalog: Promise<ProgramCatalogSnapshot> | null = null;

const getCachedProgramRows = unstable_cache(
  async () => db.program.findMany(),
  [PROGRAM_CATALOG_CACHE_TAG],
  {
    revalidate: 300,
    tags: [PROGRAM_CATALOG_CACHE_TAG]
  }
);

export async function getProgramCatalogSnapshot() {
  if (memoryCatalog && Date.now() < memoryCatalog.expiresAt) {
    return memoryCatalog.value;
  }

  if (loadingCatalog) {
    return loadingCatalog;
  }

  loadingCatalog = loadProgramCatalogSnapshot()
    .then((snapshot) => {
      memoryCatalog = {
        value: snapshot,
        expiresAt: Date.now() + CATALOG_MEMORY_TTL_MS
      };
      return snapshot;
    })
    .finally(() => {
      loadingCatalog = null;
    });

  return loadingCatalog;
}

export function clearProgramCatalogSnapshot() {
  memoryCatalog = null;
  loadingCatalog = null;
}

export async function primeProgramCatalogSnapshotFromRawRecords(records: RawProgramRecord[]) {
  setProgramCatalogSnapshot(records.map(rawRecordToProgram));
}

export async function mergeProgramCatalogSnapshotFromRawRecords(records: RawProgramRecord[]) {
  const current = memoryCatalog?.value.programs ?? (await loadPatchBaseRows());

  if (!current) {
    return;
  }

  const byId = new Map(current.map((program) => [program.id, program]));

  for (const record of records) {
    byId.set(record.Id, rawRecordToProgram(record));
  }

  setProgramCatalogSnapshot([...byId.values()]);
}

export async function upsertProgramInCatalogSnapshot(program: Program) {
  const current = memoryCatalog?.value.programs ?? (await loadPatchBaseRows());

  if (!current) {
    return;
  }

  setProgramCatalogSnapshot([...current.filter((entry) => entry.id !== program.id), normalizeProgramDates(program)]);
}

export async function deleteProgramFromCatalogSnapshot(id: string) {
  const current = memoryCatalog?.value.programs ?? (await loadPatchBaseRows());

  if (!current) {
    return;
  }

  setProgramCatalogSnapshot(current.filter((program) => program.id !== id));
}

async function loadProgramCatalogSnapshot() {
  const localRows = await loadLocalProgramRows();

  if (localRows) {
    return buildProgramCatalogSnapshot(localRows);
  }

  try {
    return buildProgramCatalogSnapshot((await getCachedProgramRows()).map(normalizeProgramDates));
  } catch {
    return buildProgramCatalogSnapshot((await db.program.findMany()).map(normalizeProgramDates));
  }
}

async function loadLocalProgramRows() {
  if (process.env.PROGRAM_CATALOG_SOURCE !== "file") {
    return null;
  }

  try {
    const raw = await readFile(path.join(process.cwd(), "programs.json"), "utf8");
    const records = extractProgramRecords(JSON.parse(raw) as unknown);
    return records.map(rawRecordToProgram);
  } catch {
    return null;
  }
}

async function loadPatchBaseRows() {
  if (process.env.PROGRAM_CATALOG_SOURCE !== "file") {
    return null;
  }

  return loadLocalProgramRows();
}

function setProgramCatalogSnapshot(programs: Program[]) {
  memoryCatalog = {
    value: buildProgramCatalogSnapshot(programs),
    expiresAt: Date.now() + CATALOG_MEMORY_TTL_MS
  };
}

function buildProgramCatalogSnapshot(programs: Program[]): ProgramCatalogSnapshot {
  const normalizedPrograms = programs.map(normalizeProgramDates);

  return {
    programs: normalizedPrograms,
    byId: new Map(normalizedPrograms.map((program) => [program.id, program])),
    byUpdated: [...normalizedPrograms].sort(compareByUpdatedDesc),
    byPriceAsc: [...normalizedPrograms].sort(compareByPriceAsc),
    byPriceDesc: [...normalizedPrograms].sort(compareByPriceDesc)
  };
}

function rawRecordToProgram(record: RawProgramRecord): Program {
  return {
    ...toProgramPersistence(record),
    createdAt: new Date(0),
    updatedAt: new Date(0)
  };
}

function normalizeProgramDates(program: SerializableProgram): Program {
  return {
    ...program,
    createdAt: program.createdAt instanceof Date ? program.createdAt : new Date(program.createdAt),
    updatedAt: program.updatedAt instanceof Date ? program.updatedAt : new Date(program.updatedAt)
  };
}

function compareByUpdatedDesc(a: Program, b: Program) {
  return b.updatedAt.getTime() - a.updatedAt.getTime();
}

function compareByPriceAsc(a: Program, b: Program) {
  const priceDelta = priceForAsc(a.discountedTuitionFee) - priceForAsc(b.discountedTuitionFee);
  return priceDelta || a.programName.localeCompare(b.programName);
}

function compareByPriceDesc(a: Program, b: Program) {
  const priceDelta = priceForDesc(b.discountedTuitionFee) - priceForDesc(a.discountedTuitionFee);
  return priceDelta || a.programName.localeCompare(b.programName);
}

function priceForAsc(value: number | null) {
  return typeof value === "number" ? value : Number.POSITIVE_INFINITY;
}

function priceForDesc(value: number | null) {
  return typeof value === "number" ? value : Number.POSITIVE_INFINITY;
}
