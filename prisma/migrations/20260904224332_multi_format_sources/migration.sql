-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('TEXT', 'MARKDOWN', 'PDF', 'DOCX', 'RTF', 'ODT', 'IMAGE');

-- CreateEnum
CREATE TYPE "PreviewKind" AS ENUM ('MARKDOWN', 'PLAIN', 'PDF', 'IMAGE');

-- AlterTable: new columns are nullable or carry defaults so existing rows survive.
ALTER TABLE "Document"
  ADD COLUMN "sourceKind" "SourceKind" NOT NULL DEFAULT 'TEXT',
  ADD COLUMN "previewKind" "PreviewKind" NOT NULL DEFAULT 'PLAIN',
  ADD COLUMN "extractedText" TEXT,
  ADD COLUMN "previewMarkdown" TEXT,
  ADD COLUMN "textTruncated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "pageCount" INTEGER;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN "documentIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: every pre-existing document is a .md or .txt file (the only
-- formats supported before this migration). Derive sourceKind/previewKind
-- from the file extension rather than leaving them at the TEXT/PLAIN column
-- default, which is only correct for .txt.
UPDATE "Document"
SET "sourceKind" = 'MARKDOWN', "previewKind" = 'MARKDOWN'
WHERE lower("fileName") LIKE '%.md' OR lower("fileName") LIKE '%.markdown';

UPDATE "Document"
SET "sourceKind" = 'TEXT', "previewKind" = 'PLAIN'
WHERE lower("fileName") LIKE '%.txt';
