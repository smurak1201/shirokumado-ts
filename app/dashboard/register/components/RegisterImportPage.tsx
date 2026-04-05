"use client";

import { useState } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import { SETTLEMENT_KEY_PATTERN } from "@/lib/register/csv-types";
import type { DiffResponse, ImportResponse } from "@/lib/register/csv-types";
import FolderSelector from "./FolderSelector";
import ImportProgress from "./ImportProgress";

type ImportState = "idle" | "checking" | "uploading" | "done";

interface RegisterImportPageProps {
  initialSummary: {
    totalFiles: number;
    lastImportedAt: string | null;
  };
}

/** 同一精算のファイルをグループ化（日付+連番部分でグループ化） */
function groupFilesBySettlement(files: File[]): Map<string, File[]> {
  const groups = new Map<string, File[]>();

  for (const file of files) {
    // Z001_16 _0001.CSV → "16 _0001"
    const match = file.name.match(SETTLEMENT_KEY_PATTERN);
    const key = match?.[1] ?? file.name;

    const group = groups.get(key) ?? [];
    group.push(file);
    groups.set(key, group);
  }

  return groups;
}

export default function RegisterImportPage({
  initialSummary,
}: RegisterImportPageProps) {
  const [state, setState] = useState<ImportState>("idle");
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState(initialSummary);

  /** フォルダ選択後の処理 */
  async function handleFilesSelected(files: File[]): Promise<void> {
    if (files.length === 0) {
      toast.error("対象のCSVファイルが見つかりませんでした");
      return;
    }

    setAllFiles(files);
    setState("checking");
    setErrors([]);

    try {
      // 差分判定
      const fileNames = files.map((f) => f.name);
      const diff = await fetchJson<DiffResponse>("/api/register/diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileNames }),
      });

      if (diff.pendingFiles.length === 0) {
        toast.info("すべてのファイルが取り込み済みです");
        setState("idle");
        return;
      }

      // 未取り込みファイルのみ抽出
      const pendingSet = new Set(diff.pendingFiles);
      const filesToUpload = files.filter((f) => pendingSet.has(f.name));
      setPendingFiles(filesToUpload);

      // アップロード開始
      await handleUpload(filesToUpload);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      setState("idle");
    }
  }

  /** ファイルアップロード処理 */
  async function handleUpload(files: File[]): Promise<void> {
    setState("uploading");
    const groups = groupFilesBySettlement(files);
    const totalGroups = groups.size;
    let currentGroup = 0;
    let totalImported = 0;
    const allErrors: string[] = [];

    setProgress({ current: 0, total: totalGroups });

    // 設計判断: 進捗表示の正確さとサーバー負荷軽減のため順次アップロード
    for (const [, groupFiles] of groups) {
      currentGroup++;
      setProgress({ current: currentGroup, total: totalGroups });

      try {
        const formData = new FormData();
        for (const file of groupFiles) {
          formData.append("files", file);
        }

        const result = await fetchJson<ImportResponse>(
          "/api/register/import",
          {
            method: "POST",
            body: formData,
          }
        );

        totalImported += result.imported;
        if (result.errors.length > 0) {
          allErrors.push(...result.errors);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "不明なエラー";
        allErrors.push(message);
      }
    }

    setErrors(allErrors);
    setState("done");

    if (totalImported > 0) {
      toast.success(`${totalImported}件のファイルを取り込みました`);
      setSummary({
        totalFiles: summary.totalFiles + totalImported,
        lastImportedAt: new Date().toISOString(),
      });
    }

    if (allErrors.length > 0) {
      toast.error(`${allErrors.length}件のエラーが発生しました`);
    }
  }

  const isProcessing = state === "checking" || state === "uploading";

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:gap-6">
          <span>取り込み済み: {summary.totalFiles}ファイル</span>
          <span>
            最終取り込み:{" "}
            {summary.lastImportedAt
              ? new Date(summary.lastImportedAt).toLocaleString("ja-JP")
              : "なし"}
          </span>
        </div>
      </div>

      {/* フォルダ選択 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">CSVデータ取り込み</h2>

        <FolderSelector
          onFilesSelected={handleFilesSelected}
          disabled={isProcessing}
        />

        {state === "checking" && (
          <p className="mt-3 text-sm text-gray-500">差分を確認中...</p>
        )}

        {allFiles.length > 0 && state !== "checking" && (
          <p className="mt-3 text-sm text-gray-500">
            選択されたCSVファイル: {allFiles.length}件
            {pendingFiles.length > 0 &&
              ` (未取り込み: ${pendingFiles.length}件)`}
          </p>
        )}
      </div>

      {/* 進捗 */}
      {state === "uploading" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ImportProgress
            current={progress.current}
            total={progress.total}
            errors={errors}
          />
        </div>
      )}

      {/* 完了 */}
      {state === "done" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-medium">取り込み完了</h3>
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="mb-1 text-sm font-medium text-red-800">
                エラー ({errors.length}件)
              </p>
              <ul className="space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-xs text-red-600">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setState("idle");
              setAllFiles([]);
              setPendingFiles([]);
              setErrors([]);
            }}
            className="mt-3 rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-all hover:bg-gray-300 cursor-pointer active:scale-95"
          >
            新しい取り込みを開始
          </button>
        </div>
      )}
    </div>
  );
}
