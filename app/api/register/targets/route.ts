// app/api/register/targets/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const yearStr = searchParams.get("year");

  if (!yearStr || isNaN(Number(yearStr))) {
    throw new ValidationError("有効な年を指定してください");
  }

  const year = Number(yearStr);

  const targets = await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.findMany({
        where: { year },
        orderBy: { month: "asc" },
      }),
    "GET /api/register/targets"
  );

  return apiSuccess({ targets });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { year, month, amount } = body;

  if (!year || typeof year !== "number" || year < 2000 || year > 2100) {
    throw new ValidationError("有効な年を指定してください");
  }
  if (!month || typeof month !== "number" || month < 1 || month > 12) {
    throw new ValidationError("有効な月を指定してください（1-12）");
  }
  if (amount === undefined || typeof amount !== "number" || amount < 0) {
    throw new ValidationError("有効な目標金額を指定してください");
  }

  const target = await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.create({
        data: { year, month, amount },
      }),
    "POST /api/register/targets"
  );

  return apiSuccess({ target }, 201);
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { id, amount } = body;

  if (!id || typeof id !== "number") {
    throw new ValidationError("有効なIDを指定してください");
  }
  if (amount === undefined || typeof amount !== "number" || amount < 0) {
    throw new ValidationError("有効な目標金額を指定してください");
  }

  const target = await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.update({
        where: { id },
        data: { amount },
      }),
    "PUT /api/register/targets"
  );

  return apiSuccess({ target });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(Number(id))) {
    throw new ValidationError("有効なIDを指定してください");
  }

  await safePrismaOperation(
    () =>
      prisma.registerSalesTarget.delete({
        where: { id: Number(id) },
      }),
    "DELETE /api/register/targets"
  );

  return apiSuccess({ success: true });
});
