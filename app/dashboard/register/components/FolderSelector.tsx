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
    if (isValidCsvFileName(file.name)) {
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
    <div>
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
