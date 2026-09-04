-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "rank" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Entry_parentId_rank_idx" ON "Entry"("parentId", "rank");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
