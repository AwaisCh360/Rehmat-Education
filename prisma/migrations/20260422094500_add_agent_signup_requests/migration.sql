-- CreateTable
CREATE TABLE "AgentSignupRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    CONSTRAINT "AgentSignupRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentSignupRequest_email_key" ON "AgentSignupRequest"("email");

-- CreateIndex
CREATE INDEX "AgentSignupRequest_status_idx" ON "AgentSignupRequest"("status");

-- CreateIndex
CREATE INDEX "AgentSignupRequest_createdAt_idx" ON "AgentSignupRequest"("createdAt");
