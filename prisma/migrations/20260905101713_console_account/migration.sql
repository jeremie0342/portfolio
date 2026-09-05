-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL DEFAULT 'console',
    "passwordHash" TEXT NOT NULL,
    "mustChange" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
