/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Previlage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_account_role_id_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_previlege_id_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Previlage";

-- DropTable
DROP TABLE "Role";

-- DropEnum
DROP TYPE "AccountStatus";

-- DropEnum
DROP TYPE "RoleType";

-- CreateTable
CREATE TABLE "Profile" (
    "account_id" UUID NOT NULL,
    "account_name" TEXT,
    "email" TEXT,
    "contact_number" TEXT,
    "photo_url" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("account_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_account_id_key" ON "Profile"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_account_name_key" ON "Profile"("account_name");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
