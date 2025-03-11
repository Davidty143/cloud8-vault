/*
  Warnings:

  - You are about to drop the column `description` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "description",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gender" TEXT;
