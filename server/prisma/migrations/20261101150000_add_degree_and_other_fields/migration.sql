-- AlterTable
ALTER TABLE "alumni_registrations" ADD COLUMN IF NOT EXISTS "degree" TEXT NOT NULL DEFAULT 'B.Tech';
ALTER TABLE "alumni_registrations" ADD COLUMN IF NOT EXISTS "otherDegree" TEXT;
ALTER TABLE "alumni_registrations" ADD COLUMN IF NOT EXISTS "otherCourse" TEXT;
ALTER TABLE "alumni_registrations" ALTER COLUMN "branch" SET DEFAULT '';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "alumni_registrations_degree_idx" ON "alumni_registrations"("degree");
CREATE INDEX IF NOT EXISTS "alumni_registrations_course_idx" ON "alumni_registrations"("course");

