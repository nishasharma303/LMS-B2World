-- AlterTable
ALTER TABLE "Institute" ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "razorpaySubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "billingCycle" INTEGER,
ADD COLUMN     "isRenewal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "razorpaySubscriptionId" TEXT;
