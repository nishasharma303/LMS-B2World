/*
  Warnings:

  - You are about to drop the column `planExpiresAt` on the `Institute` table. All the data in the column will be lost.
  - You are about to drop the column `razorpaySubscriptionId` on the `Institute` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `Institute` table. All the data in the column will be lost.
  - You are about to drop the column `billingCycle` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `isRenewal` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `razorpaySubscriptionId` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Institute" DROP COLUMN "planExpiresAt",
DROP COLUMN "razorpaySubscriptionId",
DROP COLUMN "subscriptionStatus";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "billingCycle",
DROP COLUMN "isRenewal",
DROP COLUMN "razorpaySubscriptionId";
