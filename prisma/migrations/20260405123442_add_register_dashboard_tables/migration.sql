-- CreateTable
CREATE TABLE "reg_period_presets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date_from" DATE NOT NULL,
    "date_to" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reg_period_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_machine_names" (
    "id" SERIAL NOT NULL,
    "machine_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reg_machine_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_sales_targets" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reg_sales_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_dashboard_settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "reg_dashboard_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reg_machine_names_machine_no_key" ON "reg_machine_names"("machine_no");

-- CreateIndex
CREATE UNIQUE INDEX "reg_sales_targets_year_month_key" ON "reg_sales_targets"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "reg_dashboard_settings_key_key" ON "reg_dashboard_settings"("key");
