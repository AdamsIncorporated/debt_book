import React from "react";

export default function CsvUploadRulesInline() {
  return (
    <div className="max-w-md rounded-xl bg-gray-100/80 px-4 py-3 shadow-sm shadow-gray-400/20">
      <p className="text-base leading-relaxed text-gray-600">
        <span className="font-base text-gray-700">• Missing ID:</span> Rows
        without an ID are inserted as new records.
      </p>
      <p className="mt-1 text-base leading-relaxed text-gray-600">
        <span className="font-base text-gray-700">• Removed row:</span> Removing
        a row deletes that record and may affect totals such as principal or
        interest.
      </p>
      <p className="mt-1 text-base leading-relaxed text-gray-600">
        <span className="font-base text-gray-700">• Updates:</span> Any updated
        row must include a valid ID.
      </p>
    </div>
  );
}
