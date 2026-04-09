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
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-t">
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
