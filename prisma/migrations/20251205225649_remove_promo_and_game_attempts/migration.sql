-- DropForeignKey
ALTER TABLE "GameAttempt" DROP CONSTRAINT IF EXISTS "GameAttempt_promoCodeId_fkey";

-- DropForeignKey
ALTER TABLE "GameAttempt" DROP CONSTRAINT IF EXISTS "GameAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_promoId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "GameAttempt_userId_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "PromoCode_code_key";

-- DropTable
DROP TABLE IF EXISTS "GameAttempt";

-- DropTable
DROP TABLE IF EXISTS "PromoCode";

-- AlterTable: Remove promoId column from Order table
ALTER TABLE "Order" DROP COLUMN IF EXISTS "promoId";

-- AlterTable: Remove gameAttempts relation from User table (this is just metadata, no column to drop)

