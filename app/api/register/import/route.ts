import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { parseCsvFile } from "@/lib/register/csv-parser";
import { isValidCsvFileName } from "@/lib/register/csv-types";
import type {
  ImportResponse,
  Z001Row,
  Z002Row,
  Z004Row,
  Z005Row,
  Z009Row,
} from "@/lib/register/csv-types";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const files = formData.getAll("files").filter(
    (entry): entry is File => entry instanceof File
  );

  if (files.length === 0) {
    throw new ValidationError("ファイルが指定されていません");
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const file of files) {
    // webkitdirectory経由だとパス付きで送られる場合があるためベースネームを使用
    const baseName = file.name.split("/").pop() ?? file.name;

    if (!isValidCsvFileName(baseName)) {
      errors.push(`ファイル名が不正です: ${baseName}`);
      continue;
    }

    try {
      const buffer = await file.arrayBuffer();
      const result = parseCsvFile(buffer, baseName);
      const { metadata, fileType, rows } = result;

      let alreadyImported = false;
      await safePrismaOperation(async () => {
        await prisma.$transaction(async (tx) => {
          // 取り込み済みファイルはスキップ（差分判定との間のタイミング差を考慮）
          const existing = await tx.registerImportFile.findUnique({
            where: { fileName: baseName },
          });
          if (existing) {
            alreadyImported = true;
            return;
          }

          // 精算ヘッダーの upsert
          const settlement = await tx.registerSettlement.upsert({
            where: {
              machineNo_settlementCount_date_time: {
                machineNo: metadata.machineNo,
                settlementCount: metadata.settlementCount,
                date: metadata.date,
                time: metadata.time,
              },
            },
            create: {
              machineNo: metadata.machineNo,
              settlementCount: metadata.settlementCount,
              date: metadata.date,
              time: metadata.time,
            },
            update: {},
          });

          // 種別に応じたデータ登録
          switch (fileType) {
            case "Z001":
              await tx.registerSalesSummary.createMany({
                data: (rows as Z001Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z002":
              await tx.registerTransactionKey.createMany({
                data: (rows as Z002Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z004":
              await tx.registerProductSale.createMany({
                data: (rows as Z004Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z005":
              await tx.registerDepartmentSale.createMany({
                data: (rows as Z005Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
            case "Z009":
              await tx.registerHourlySale.createMany({
                data: (rows as Z009Row[]).map((row) => ({
                  settlementId: settlement.id,
                  ...row,
                })),
                skipDuplicates: true,
              });
              break;
          }

          // ファイル管理テーブルに登録
          await tx.registerImportFile.create({
            data: {
              fileName: baseName,
              fileType,
              settlementId: settlement.id,
            },
          });
        });
      }, `register/import - ${baseName}`);

      if (alreadyImported) {
        skipped++;
        continue;
      }
      imported++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラー";
      errors.push(`${baseName}: ${message}`);
      log.error(`CSV取り込みエラー: ${baseName}`, {
        context: "register/import",
        error,
      });
    }
  }

  const response: ImportResponse = { imported, skipped, errors };
  return apiSuccess(response);
});
