import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import type { MachinesResponse } from "@/app/dashboard/register/types";

export const dynamic = "force-dynamic";

// レジ一覧はほぼ変わらないため長めにキャッシュ
const CACHE_MAX_AGE = 3600; // 1時間

export const GET = withErrorHandling(async () => {
  const settlements = await safePrismaOperation(
    () =>
      prisma.registerSettlement.findMany({
        select: { machineNo: true },
        distinct: ["machineNo"],
        orderBy: { machineNo: "asc" },
      }),
    "GET /api/register/machines"
  );

  const machineNos = settlements.map((s) => s.machineNo);

  // レジ名称は未登録でも動作に支障ないため、エラー時は空で続行
  const nameMap = new Map<string, string>();
  try {
    if (machineNos.length > 0) {
      const names = await prisma.registerMachineName.findMany({
        where: { machineNo: { in: machineNos } },
      });
      for (const n of names) {
        nameMap.set(n.machineNo, n.name);
      }
    }
  } catch {
    // 名称テーブルが取得できなくても続行
  }

  // データがある最新の日付を取得
  const latest = await safePrismaOperation(
    () =>
      prisma.registerSettlement.findFirst({
        select: { date: true },
        orderBy: { date: "desc" },
      }),
    "GET /api/register/machines (latestDate)"
  );
  const latestDate = latest?.date
    ? latest.date.toISOString().split("T")[0]!
    : null;

  const response: MachinesResponse = {
    machines: machineNos.map((no) => ({
      machineNo: no,
      name: nameMap.get(no) ?? null,
    })),
    latestDate,
  };

  const res = apiSuccess(response);
  res.headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE}`);
  return res;
});
