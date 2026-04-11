-- CreateEnum
CREATE TYPE "InstituteStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Institute" ADD COLUMN     "secondaryColor" TEXT,
ADD COLUMN     "status" "InstituteStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "storageLimitMb" INTEGER NOT NULL DEFAULT 1024,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
