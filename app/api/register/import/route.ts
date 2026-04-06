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
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    log.error("FormDataのパースに失敗", { context: "register/import", error });
    throw new ValidationError("ファイルデータの読み取りに失敗しました");
  }

  const files = formData.getAll("files").filter(
    (entry): entry is File => entry instanceof File
  );

  if (files.length === 0) {
    throw new ValidationError("ファイルが指定されていません");
  }

  const registerName = formData.get("registerName");

  log.info(`取り込み開始: ${files.length}ファイル`, {
    context: "register/import",
    metadata: { fileNames: files.map((f) => f.name), registerName },
  });

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const importedMachineNos = new Set<string>();

  for (const file of files) {
    // パス付きファイル名で一意に識別（例: 2023/04/Z001_14 _0001.CSV）
    const fileName = file.name;
    const baseName = fileName.split("/").pop() ?? fileName;

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
            where: { fileName },
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

          // ファイル管理テーブルに登録（パス付きファイル名で一意に管理）
          await tx.registerImportFile.create({
            data: {
              fileName,
              fileType,
              settlementId: settlement.id,
            },
          });
        });
      }, `register/import - ${fileName}`);

      if (alreadyImported) {
        skipped++;
        continue;
      }
      imported++;
      importedMachineNos.add(metadata.machineNo);
    } catch (error) {
      // causeに元のPrismaエラーが含まれる場合は詳細を表示
      const cause = error instanceof Error && error.cause instanceof Error
        ? error.cause.message
        : undefined;
      const message =
        error instanceof Error ? error.message : "不明なエラー";
      const detail = cause ? `${message} (${cause})` : message;
      errors.push(`${fileName}: ${detail}`);
      log.error(`CSV取り込みエラー: ${fileName}`, {
        context: "register/import",
        error,
      });
    }
  }

  // レジ名の自動登録（未登録のmachineNoにデフォルト名としてフォルダ名を設定）
  if (typeof registerName === "string" && registerName && importedMachineNos.size > 0) {
    for (const machineNo of importedMachineNos) {
      try {
        await prisma.registerMachineName.upsert({
          where: { machineNo },
          create: { machineNo, name: registerName },
          update: {},
        });
      } catch {
        // レジ名の登録失敗は取り込み結果に影響しないため続行
      }
    }
  }

  const response: ImportResponse = { imported, skipped, errors };
  return apiSuccess(response);
});
