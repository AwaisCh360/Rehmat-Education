CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Program" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "universityName" TEXT NOT NULL,
  "programDegree" TEXT,
  "programName" TEXT NOT NULL,
  "universityNameCn" TEXT,
  "programNameCn" TEXT,
  "alternativeProgramName" TEXT,
  "currencyType" TEXT,
  "tuitionFeeOriginal" TEXT,
  "discountedTuitionFeeOriginal" TEXT,
  "cashPaymentFeeOriginal" TEXT,
  "prepSchoolFeeOriginal" TEXT,
  "depositPriceOriginal" TEXT,
  "tuitionFee" REAL,
  "discountedTuitionFee" REAL,
  "cashPaymentFee" REAL,
  "prepSchoolFee" REAL,
  "depositPrice" REAL,
  "language" TEXT,
  "campus" TEXT,
  "quotaFull" BOOLEAN NOT NULL DEFAULT false,
  "programRef" TEXT,
  "termSettings" TEXT,
  "semester" TEXT,
  "universityId" TEXT,
  "academicYear" TEXT,
  "unilogo" TEXT,
  "universityKey" TEXT NOT NULL,
  "programKey" TEXT NOT NULL,
  "degreeKey" TEXT NOT NULL,
  "languageKey" TEXT NOT NULL,
  "campusKey" TEXT NOT NULL,
  "searchText" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "ImportSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fileName" TEXT NOT NULL,
  "importMode" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PREVIEW',
  "rowCount" INTEGER NOT NULL,
  "diffJson" TEXT NOT NULL,
  "payloadJson" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "createdById" TEXT NOT NULL,
  CONSTRAINT "ImportSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Program_universityKey_idx" ON "Program"("universityKey");
CREATE INDEX "Program_programKey_idx" ON "Program"("programKey");
CREATE INDEX "Program_degreeKey_idx" ON "Program"("degreeKey");
CREATE INDEX "Program_languageKey_idx" ON "Program"("languageKey");
CREATE INDEX "Program_campusKey_idx" ON "Program"("campusKey");
CREATE INDEX "Program_discountedTuitionFee_idx" ON "Program"("discountedTuitionFee");
CREATE INDEX "Program_tuitionFee_idx" ON "Program"("tuitionFee");
CREATE INDEX "ImportSession_createdById_idx" ON "ImportSession"("createdById");
