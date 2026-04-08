// app/api/register/machines/names/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const names = await safePrismaOperation(
    () =>
      prisma.registerMachineName.findMany({
        orderBy: { machineNo: "asc" },
      }),
    "GET /api/register/machines/names"
  );

  return apiSuccess({ names });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { machineNo, name } = body;

  if (!machineNo || typeof machineNo !== "string" || machineNo.trim().length === 0) {
    throw new ValidationError("レジ番号を入力してください");
  }
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ValidationError("表示名を入力してください");
  }

  const created = await safePrismaOperation(
    () =>
      prisma.registerMachineName.create({
        data: {
          machineNo: machineNo.trim(),
          name: name.trim(),
        },
      }),
    "POST /api/register/machines/names"
  );

  return apiSuccess({ name: created }, 201);
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { id, name } = body;

  if (!id || typeof id !== "number") {
    throw new ValidationError("有効なIDを指定してください");
  }

  // 空欄の場合はデフォルト名（CSV取り込み時のフォルダ名）に戻す
  const trimmedName = typeof name === "string" ? name.trim() : "";

  let newName = trimmedName;
  if (!newName) {
    const current = await safePrismaOperation(
      () => prisma.registerMachineName.findUnique({ where: { id } }),
      "PUT /api/register/machines/names (findUnique)"
    );
    if (!current) {
      throw new ValidationError("指定されたレジ名が見つかりません");
    }
    if (!current.defaultName) {
      throw new ValidationError("デフォルト名が未登録です。CSVを再取り込みしてください");
    }
    newName = current.defaultName;
  }

  const updated = await safePrismaOperation(
    () =>
      prisma.registerMachineName.update({
        where: { id },
        data: { name: newName },
      }),
    "PUT /api/register/machines/names"
  );

  return apiSuccess({ name: updated });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(Number(id))) {
    throw new ValidationError("有効なIDを指定してください");
  }

  await safePrismaOperation(
    () =>
      prisma.registerMachineName.delete({
        where: { id: Number(id) },
      }),
    "DELETE /api/register/machines/names"
  );

  return apiSuccess({ success: true });
});
