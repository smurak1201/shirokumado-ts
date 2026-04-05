import type { Metadata } from "next";
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { log } from "@/lib/logger";
import type { ImportSummary } from "./types";
import RegisterPageTabs from "./components/RegisterPageTabs";

export const metadata: Metadata = {
  title: "レジデータ",
  description: "レジのCSVデータをDBに取り込む管理画面",
};

export const dynamic = "force-dynamic";

async function getImportSummary(): Promise<ImportSummary> {
  try {
    const result = await safePrismaOperation(
      () =>
        prisma.registerImportFile.aggregate({
          _count: { _all: true },
          _max: { importedAt: true },
        }),
      "register page summary"
    );

    return {
      totalFiles: result._count._all,
      lastImportedAt: result._max.importedAt?.toISOString() ?? null,
    };
  } catch (error) {
    log.error("取り込みサマリーの取得に失敗しました", {
      context: "getImportSummary",
      error,
    });
    return { totalFiles: 0, lastImportedAt: null };
  }
}

export default async function RegisterPage() {
  const summary = await getImportSummary();

  return <RegisterPageTabs initialSummary={summary} />;
}
