-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "ingestAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inngestRunId" TEXT,
ADD COLUMN     "processingStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "blocks" JSONB;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Document_status_processingStartedAt_idx" ON "Document"("status", "processingStartedAt");

-- CreateIndex
CREATE INDEX "Document_projectId_deletedAt_idx" ON "Document"("projectId", "deletedAt");

-- CreateIndex
CREATE INDEX "Project_userId_deletedAt_idx" ON "Project"("userId", "deletedAt");
