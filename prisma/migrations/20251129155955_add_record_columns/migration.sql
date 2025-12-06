/*
  Warnings:

  - Added the required column `recordDate` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `Contractor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `Contractor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `EscrowWalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `EscrowWalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `FileStorageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `FileStorageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `Manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `Manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `ProcurementRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `ProcurementRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordDate` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordTime` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('savings', 'current', 'checking', 'business');

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "Contractor" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "EscrowWalletTransaction" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "FileStorageRecord" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "ProcurementRequest" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "recordDate" TEXT,
ADD COLUMN     "recordTime" TEXT;

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" "Role" NOT NULL,
    "projectId" TEXT,
    "amount" DECIMAL(19,4) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "bankName" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "accountType" "BankAccountType" NOT NULL,
    "accountNumberEnc" TEXT NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "proofPath" TEXT,
    "proofContentType" TEXT,
    "proofSize" INTEGER,
    "recordDate" TEXT NOT NULL,
    "recordTime" TEXT NOT NULL,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentRequest_userId_idx" ON "PaymentRequest"("userId");

-- CreateIndex
CREATE INDEX "PaymentRequest_projectId_idx" ON "PaymentRequest"("projectId");

-- CreateIndex
CREATE INDEX "PaymentRequest_status_idx" ON "PaymentRequest"("status");

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
