-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BANNED', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'USER', 'GUEST');

-- CreateTable
CREATE TABLE "Account" (
    "account_id" UUID NOT NULL,
    "account_username" TEXT,
    "account_email" TEXT,
    "account_photo_url" TEXT,
    "account_status" "AccountStatus" NOT NULL,
    "account_is_deleted" BOOLEAN NOT NULL,
    "account_iscreated_timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "account_modified_timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "account_role_id" UUID NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" UUID NOT NULL,
    "role_type" "RoleType" NOT NULL,
    "previlege_id" UUID NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Previlage" (
    "previlege_id" UUID NOT NULL,
    "previlege_name" TEXT,
    "previlege_description" TEXT,

    CONSTRAINT "Previlage_pkey" PRIMARY KEY ("previlege_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_id_key" ON "Account"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_username_key" ON "Account"("account_username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_email_key" ON "Account"("account_email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_id_key" ON "Role"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Previlage_previlege_id_key" ON "Previlage"("previlege_id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_account_role_id_fkey" FOREIGN KEY ("account_role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_previlege_id_fkey" FOREIGN KEY ("previlege_id") REFERENCES "Previlage"("previlege_id") ON DELETE RESTRICT ON UPDATE CASCADE;
