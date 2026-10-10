-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pastor" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "ticketId" TEXT NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "churchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BOUNCER', 'INVITEE');

-- CreateTable
CREATE TABLE "User" (
    "id"           TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "role"         "Role" NOT NULL DEFAULT 'INVITEE',
    "memberId"     TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE UNIQUE INDEX "Member_ticketId_key" ON "Member"("ticketId");

-- CreateIndex
CREATE INDEX "Member_churchId_idx" ON "Member"("churchId");

-- CreateIndex
CREATE INDEX "Member_ticketId_idx" ON "Member"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;




