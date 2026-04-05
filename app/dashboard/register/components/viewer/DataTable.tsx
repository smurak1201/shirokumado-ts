"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  align?: "left" | "right";
  format?: (value: T[keyof T], row: T) => string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** 特定行をハイライトする条件（取引管理の訂正行など） */
  highlightRow?: (row: T) => boolean;
}

export default function DataTable<T>({
  columns,
  data,
  highlightRow,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={col.align === "right" ? "text-right" : "text-left"}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={i}
              className={highlightRow?.(row) ? "bg-yellow-50" : undefined}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={col.align === "right" ? "text-right" : "text-left"}
                >
                  {col.format
                    ? col.format(row[col.key], row)
                    : String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
