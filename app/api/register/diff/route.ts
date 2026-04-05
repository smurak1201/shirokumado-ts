import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { isValidCsvFileName } from "@/lib/register/csv-types";
import type { DiffResponse } from "@/lib/register/csv-types";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { fileNames } = body;

  if (!Array.isArray(fileNames) || fileNames.length === 0) {
    throw new ValidationError("ファイル名の一覧が必要です");
  }

  if (!fileNames.every((name: unknown) => typeof name === "string")) {
    throw new ValidationError("ファイル名は文字列で指定してください");
  }

  const validFileNames = fileNames.filter(isValidCsvFileName);

  // 取り込み済みファイル名を取得
  const importedFiles = await safePrismaOperation(
    () =>
      prisma.registerImportFile.findMany({
        where: { fileName: { in: validFileNames } },
        select: { fileName: true },
      }),
    "register/diff"
  );

  const importedSet = new Set(importedFiles.map((f) => f.fileName));
  const pendingFiles = validFileNames.filter(
    (name) => !importedSet.has(name)
  );

  const response: DiffResponse = {
    pendingFiles,
    importedCount: importedSet.size,
    totalCount: validFileNames.length,
  };

  return apiSuccess(response);
});
