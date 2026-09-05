-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hydeEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "retrievalLimit" INTEGER NOT NULL DEFAULT 8;

-- CreateIndex
CREATE INDEX "Document_userId_createdAt_idx" ON "Document"("userId", "createdAt");
