-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "credential_entry_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "position_entry_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "project_entry_fkey";

-- DropForeignKey
ALTER TABLE "World" DROP CONSTRAINT "world_entry_fkey";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "project_entry_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "World" ADD CONSTRAINT "world_entry_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "credential_entry_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "position_entry_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
