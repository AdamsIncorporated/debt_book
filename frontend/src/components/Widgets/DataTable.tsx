import React from "react";
import { formatNumber } from "../../utils/func";

export type Column<T> = {
  label: string;
  key: keyof T;
  align?: "right";
  format?: "number" | "m/dd/yyyy";
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
};

export function DataTable<T>({ columns, rows }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl shadow-md border border-gray-200">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className={`px-4 py-3 font-medium text-gray-700 ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="
                transition 
                hover:bg-gray-50 
                hover:shadow-sm 
                rounded-xl
              "
            >
              {columns.map((c) => (
                <td
                  key={String(c.key)}
                  className={`
                    px-4 py-3 
                    text-gray-800 
                    ${c.align === "right" ? "text-right" : ""}
                  `}
                >
                  {c.format === "number"
                    ? formatNumber(row[c.key])
                    : (row[c.key] as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
