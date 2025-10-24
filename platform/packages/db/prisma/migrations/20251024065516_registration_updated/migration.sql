/*
  Warnings:

  - You are about to drop the `Registration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistrationParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_hackathonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RegistrationParticipant" DROP CONSTRAINT "RegistrationParticipant_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RegistrationParticipant" DROP CONSTRAINT "RegistrationParticipant_userId_fkey";

-- DropTable
DROP TABLE "public"."Registration";

-- DropTable
DROP TABLE "public"."RegistrationParticipant";

-- CreateTable
CREATE TABLE "IndividualRegistration" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "githubUrl" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "college" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "profileScore" INTEGER NOT NULL,
    "eligibility" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndividualRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRegistration" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "leaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingTeamMember" (
    "id" TEXT NOT NULL,
    "teamRegistrationId" TEXT NOT NULL,
    "joinToken" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "college" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "claimedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndividualRegistration_hackathonId_userId_key" ON "IndividualRegistration"("hackathonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamRegistration_hackathonId_teamName_key" ON "TeamRegistration"("hackathonId", "teamName");

-- CreateIndex
CREATE UNIQUE INDEX "PendingTeamMember_joinToken_key" ON "PendingTeamMember"("joinToken");

-- AddForeignKey
ALTER TABLE "IndividualRegistration" ADD CONSTRAINT "IndividualRegistration_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualRegistration" ADD CONSTRAINT "IndividualRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRegistration" ADD CONSTRAINT "TeamRegistration_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingTeamMember" ADD CONSTRAINT "PendingTeamMember_teamRegistrationId_fkey" FOREIGN KEY ("teamRegistrationId") REFERENCES "TeamRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingTeamMember" ADD CONSTRAINT "PendingTeamMember_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
