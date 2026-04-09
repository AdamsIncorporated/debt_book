import React from "react";

type SkeletonTableProps = {
  columnCount: number;
  rowCount?: number;
};

export const SkeletonTable = ({
  columnCount,
  rowCount = 5,
}: SkeletonTableProps) => {
  return (
    <div className="mt-6 overflow-hidden rounded-lg">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr>
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-2/3 rounded bg-gray-300 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="space-y-2">
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
