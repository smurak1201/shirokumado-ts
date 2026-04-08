// app/api/register/presets/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const presets = await safePrismaOperation(
    () =>
      prisma.registerPeriodPreset.findMany({
        orderBy: { createdAt: "desc" },
      }),
    "GET /api/register/presets"
  );

  return apiSuccess({ presets });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { name, dateFrom, dateTo } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ValidationError("プリセット名を入力してください");
  }
  if (!dateFrom || !dateTo) {
    throw new ValidationError("開始日と終了日を指定してください");
  }
  if (new Date(dateFrom) > new Date(dateTo)) {
    throw new ValidationError("開始日は終了日より前に設定してください");
  }

  const preset = await safePrismaOperation(
    () =>
      prisma.registerPeriodPreset.create({
        data: {
          name: name.trim(),
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo),
        },
      }),
    "POST /api/register/presets"
  );

  return apiSuccess({ preset }, 201);
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(Number(id))) {
    throw new ValidationError("有効なプリセットIDを指定してください");
  }

  await safePrismaOperation(
    () =>
      prisma.registerPeriodPreset.delete({
        where: { id: Number(id) },
      }),
    "DELETE /api/register/presets"
  );

  return apiSuccess({ success: true });
});
