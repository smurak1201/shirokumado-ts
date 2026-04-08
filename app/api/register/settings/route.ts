// app/api/register/settings/route.ts（新規作成）

import { NextRequest } from "next/server";
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { ValidationError } from "@/lib/errors";
import { prisma, safePrismaOperation } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_KEYS = ["defaultPeriodType", "defaultTab"] as const;
type SettingKey = (typeof VALID_KEYS)[number];

function isValidKey(key: string): key is SettingKey {
  return (VALID_KEYS as readonly string[]).includes(key);
}

export const GET = withErrorHandling(async () => {
  const settings = await safePrismaOperation(
    () => prisma.registerDashboardSetting.findMany(),
    "GET /api/register/settings"
  );

  return apiSuccess({ settings });
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { key, value } = body;

  if (!key || typeof key !== "string" || !isValidKey(key)) {
    throw new ValidationError(
      `有効な設定キーを指定してください（${VALID_KEYS.join(", ")}）`
    );
  }
  if (value === undefined || typeof value !== "string") {
    throw new ValidationError("設定値を文字列で指定してください");
  }

  // upsert: 存在すれば更新、なければ作成
  const setting = await safePrismaOperation(
    () =>
      prisma.registerDashboardSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    "PUT /api/register/settings"
  );

  return apiSuccess({ setting });
});
