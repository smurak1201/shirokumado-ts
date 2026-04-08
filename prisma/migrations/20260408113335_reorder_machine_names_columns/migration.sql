-- カラム順を整理: id, machine_no, name, default_name, created_at

-- 新テーブルを希望のカラム順で作成
CREATE TABLE "reg_machine_names_new" (
    "id" SERIAL NOT NULL,
    "machine_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default_name" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reg_machine_names_new_pkey" PRIMARY KEY ("id")
);

-- 既存データを移行
INSERT INTO "reg_machine_names_new" ("id", "machine_no", "name", "default_name", "created_at")
SELECT "id", "machine_no", "name", "default_name", "created_at"
FROM "reg_machine_names";

-- シーケンスを引き継ぐ
SELECT setval(pg_get_serial_sequence('"reg_machine_names_new"', 'id'),
  COALESCE((SELECT MAX("id") FROM "reg_machine_names_new"), 0) + 1, false);

-- 旧テーブルを削除し、新テーブルをリネーム
DROP TABLE "reg_machine_names";
ALTER TABLE "reg_machine_names_new" RENAME TO "reg_machine_names";

-- ユニーク制約を再作成
CREATE UNIQUE INDEX "reg_machine_names_machine_no_key" ON "reg_machine_names"("machine_no");
