"use client";

import { useRef } from "react";
import { isValidCsvFileName } from "@/lib/register/csv-types";

interface FolderSelectorProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

/** 対象CSVファイルのみフィルタ */
function filterCsvFiles(fileList: FileList): File[] {
  const files: File[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (!file) continue;
    // パス付きファイル名からベースネームを取得してバリデーション
    const baseName = file.name.split("/").pop() ?? file.name;
    if (isValidCsvFileName(baseName)) {
      files.push(file);
    }
  }

  return files;
}

export default function FolderSelector({
  onFilesSelected,
  disabled,
}: FolderSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const csvFiles = filterCsvFiles(fileList);
    onFilesSelected(csvFiles);

    // 同じフォルダを再選択できるようにリセット
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <p className="mb-2 font-medium text-gray-700">
          以下のフォルダを選択してください
        </p>
        <div className="font-mono text-xs leading-relaxed">
          <p>SDカード</p>
          <p className="ml-3">
            <span className="text-gray-400">└─</span> CASIO
          </p>
          <p className="ml-9">
            <span className="text-gray-400">└─</span>{" "}
            <span className="border-b border-dashed border-gray-400">
              レジの機種名
            </span>
            <span className="ml-1 font-sans text-gray-400">
              (例: SR500_550_4000)
            </span>
          </p>
          <p className="ml-16">
            <span className="text-gray-400">├─</span>{" "}
            <span className="text-gray-400">BACKUP</span>
          </p>
          <p className="ml-16">
            <span className="text-gray-400">├─</span>{" "}
            <span className="text-gray-400">XZ</span>
          </p>
          <p className="ml-16">
            <span className="text-gray-400">└─</span>{" "}
            <span className="rounded bg-gray-900 px-1.5 py-0.5 font-bold text-white">
              XZ_BKUP
            </span>
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={inputRef}
        // @ts-expect-error webkitdirectory は標準属性ではないが主要ブラウザで対応
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50 cursor-pointer active:scale-95"
      >
        XZ_BKUPフォルダを選択
      </button>
    </div>
  );
}
