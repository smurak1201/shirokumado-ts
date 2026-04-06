"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-fetch";
import { getUserFriendlyMessageJa } from "@/lib/errors";
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

/** webkitRelativePathから先頭のレジ名セグメントを除去（例: SR500/XZ_BKUP/... → XZ_BKUP/...） */
function stripRegisterName(file: File): string {
  const path = file.webkitRelativePath || file.name;
  const slashIndex = path.indexOf("/");
  return slashIndex >= 0 ? path.slice(slashIndex + 1) : path;
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
  async function handleFilesSelected(files: File[], selectedRegisterName: string): Promise<void> {
    if (files.length === 0) {
      toast.error("対象のCSVファイルが見つかりませんでした");
      return;
    }

    setAllFiles(files);
    setState("checking");
    setErrors([]);

    try {
      // レジ名セグメントを除去してDB保存形式に合わせる（例: XZ_BKUP/2026/03/Z001_01_0001.CSV）
      const fileNames = files.map(stripRegisterName);
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
      const filesToUpload = files.filter((f) =>
        pendingSet.has(stripRegisterName(f))
      );
      setPendingFiles(filesToUpload);

      // アップロード開始
      await handleUpload(filesToUpload, selectedRegisterName);
    } catch (error) {
      toast.error(getUserFriendlyMessageJa(error));
      setState("idle");
    }
  }

  /** ファイルをVercelのボディサイズ制限（4.5MB）に収まるバッチに分割 */
  function createBatches(files: File[]): File[][] {
    const MAX_BATCH_SIZE = 3.5 * 1024 * 1024;
    const batches: File[][] = [];
    let currentBatch: File[] = [];
    let currentSize = 0;

    for (const file of files) {
      if (currentBatch.length > 0 && currentSize + file.size > MAX_BATCH_SIZE) {
        batches.push(currentBatch);
        currentBatch = [];
        currentSize = 0;
      }
      currentBatch.push(file);
      currentSize += file.size;
    }
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /** ファイルアップロード処理（サイズベースでバッチ送信） */
  async function handleUpload(files: File[], uploadRegisterName: string): Promise<void> {
    setState("uploading");
    let totalImported = 0;
    const allErrors: string[] = [];
    const batches = createBatches(files);
    let processedFiles = 0;

    setProgress({ current: 0, total: files.length });

    for (const batch of batches) {
      try {
        const formData = new FormData();
        formData.append("registerName", uploadRegisterName);
        for (const file of batch) {
          // ファイル名をレジ名除去済みの形式で送信（DB保存形式と一致させる）
          formData.append("files", file, stripRegisterName(file));
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
        const names = batch
          .map((f) => f.name.split("/").pop() ?? "不明")
          .join(", ");
        const message =
          error instanceof Error ? error.message : "不明なエラー";
        allErrors.push(`${names}: ${message}`);
      }

      processedFiles += batch.length;
      setProgress({ current: processedFiles, total: files.length });
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

  // アップロード中にページ離脱・リロードすると一部グループが未処理になるため警告を表示
  useEffect(() => {
    if (!isProcessing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing]);

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
