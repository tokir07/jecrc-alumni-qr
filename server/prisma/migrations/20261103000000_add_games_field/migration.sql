-- AlterTable
ALTER TABLE "alumni_registrations" ADD COLUMN IF NOT EXISTS "games" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

