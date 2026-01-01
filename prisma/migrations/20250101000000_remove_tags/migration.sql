-- DropForeignKey
ALTER TABLE "_ProductToTag" DROP CONSTRAINT "_ProductToTag_B_fkey";

-- DropTable
DROP TABLE IF EXISTS "_ProductToTag";
DROP TABLE IF EXISTS "tags";
