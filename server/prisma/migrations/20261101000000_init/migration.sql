-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VOLUNTEER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOLUNTEER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2026,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_registrations" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "normalizedMobile" TEXT NOT NULL,
    "currentCity" TEXT,
    "graduationYear" INTEGER NOT NULL,
    "course" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "qrTokenHash" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "alumniRegistrationId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInBy" TEXT NOT NULL,
    "gateName" TEXT NOT NULL DEFAULT 'Main Gate',

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_registrations_registrationId_key" ON "alumni_registrations"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_registrations_normalizedEmail_key" ON "alumni_registrations"("normalizedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_registrations_normalizedMobile_key" ON "alumni_registrations"("normalizedMobile");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_registrations_qrTokenHash_key" ON "alumni_registrations"("qrTokenHash");

-- CreateIndex
CREATE INDEX "alumni_registrations_normalizedEmail_idx" ON "alumni_registrations"("normalizedEmail");

-- CreateIndex
CREATE INDEX "alumni_registrations_normalizedMobile_idx" ON "alumni_registrations"("normalizedMobile");

-- CreateIndex
CREATE INDEX "alumni_registrations_registrationId_idx" ON "alumni_registrations"("registrationId");

-- CreateIndex
CREATE INDEX "alumni_registrations_qrTokenHash_idx" ON "alumni_registrations"("qrTokenHash");

-- CreateIndex
CREATE INDEX "alumni_registrations_graduationYear_idx" ON "alumni_registrations"("graduationYear");

-- CreateIndex
CREATE INDEX "alumni_registrations_branch_idx" ON "alumni_registrations"("branch");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_alumniRegistrationId_key" ON "check_ins"("alumniRegistrationId");

-- CreateIndex
CREATE INDEX "check_ins_checkedInAt_idx" ON "check_ins"("checkedInAt");

-- AddForeignKey
ALTER TABLE "alumni_registrations" ADD CONSTRAINT "alumni_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_alumniRegistrationId_fkey" FOREIGN KEY ("alumniRegistrationId") REFERENCES "alumni_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
