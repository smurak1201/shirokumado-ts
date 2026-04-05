-- CreateTable
CREATE TABLE "reg_settlements" (
    "id" SERIAL NOT NULL,
    "machine_no" TEXT NOT NULL,
    "settlement_count" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reg_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_import_files" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reg_import_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_sales_summaries" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "record_no" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "reg_sales_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_transaction_keys" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "record_no" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "reg_transaction_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_product_sales" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "record_no" INTEGER NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "reg_product_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_department_sales" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "record_no" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "reg_department_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_hourly_sales" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "record_no" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "reg_hourly_sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reg_settlements_machine_no_settlement_count_date_time_key" ON "reg_settlements"("machine_no", "settlement_count", "date", "time");

-- CreateIndex
CREATE UNIQUE INDEX "reg_import_files_file_name_key" ON "reg_import_files"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "reg_sales_summaries_settlement_id_record_no_key" ON "reg_sales_summaries"("settlement_id", "record_no");

-- CreateIndex
CREATE UNIQUE INDEX "reg_transaction_keys_settlement_id_record_no_key" ON "reg_transaction_keys"("settlement_id", "record_no");

-- CreateIndex
CREATE UNIQUE INDEX "reg_product_sales_settlement_id_record_no_key" ON "reg_product_sales"("settlement_id", "record_no");

-- CreateIndex
CREATE UNIQUE INDEX "reg_department_sales_settlement_id_record_no_key" ON "reg_department_sales"("settlement_id", "record_no");

-- CreateIndex
CREATE UNIQUE INDEX "reg_hourly_sales_settlement_id_record_no_key" ON "reg_hourly_sales"("settlement_id", "record_no");

-- AddForeignKey
ALTER TABLE "reg_import_files" ADD CONSTRAINT "reg_import_files_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "reg_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reg_sales_summaries" ADD CONSTRAINT "reg_sales_summaries_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "reg_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reg_transaction_keys" ADD CONSTRAINT "reg_transaction_keys_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "reg_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reg_product_sales" ADD CONSTRAINT "reg_product_sales_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "reg_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reg_department_sales" ADD CONSTRAINT "reg_department_sales_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "reg_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reg_hourly_sales" ADD CONSTRAINT "reg_hourly_sales_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "reg_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
