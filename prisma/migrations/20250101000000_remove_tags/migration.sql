-- DropForeignKey
ALTER TABLE "_ProductToTag" DROP CONSTRAINT IF EXISTS "_ProductToTag_B_fkey";

-- DropTable
DROP TABLE IF EXISTS "_ProductToTag";
DROP TABLE IF EXISTS "tags";
