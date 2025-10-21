-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_ACCOUNT', 'CREDIT_CARD', 'OTHER');

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "bankAccountId" UUID,
ADD COLUMN     "creditCardId" UUID,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bankName" TEXT NOT NULL,
    "alias" TEXT,
    "accountType" TEXT,
    "accountNumber" TEXT,
    "balance" DECIMAL(12,2) NOT NULL,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_cards" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bankAccountId" UUID,
    "issuer" TEXT NOT NULL,
    "brand" TEXT,
    "last4" TEXT,
    "limit" DECIMAL(12,2),
    "currentBalance" DECIMAL(12,2),
    "statementDay" INTEGER,
    "dueDay" INTEGER,
    "alias" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_accounts_userId_bankName_idx" ON "bank_accounts"("userId", "bankName");

-- CreateIndex
CREATE INDEX "credit_cards_userId_issuer_idx" ON "credit_cards"("userId", "issuer");

-- CreateIndex
CREATE INDEX "expenses_bankAccountId_idx" ON "expenses"("bankAccountId");

-- CreateIndex
CREATE INDEX "expenses_creditCardId_idx" ON "expenses"("creditCardId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
