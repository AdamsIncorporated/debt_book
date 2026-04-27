import React from "react";
import { useParams } from "react-router-dom";
import { useState, useCallback } from "react";
import { useDebtPricingColumns } from "../../hooks/useDebtPricingColumns";
import { useDebtPricingLoader } from "../../hooks/useDebtPricingLoader";
import { useDebtPricingUpload } from "../../hooks/useDebtPricingUpload";
import { downloadExcelTemplate } from "../../utils/func";
import { DataTable } from "../Widgets/DataTable";
import { UploadBar } from "../Widgets/UploadBar";
import { SkeletonTable } from "../Widgets/SkeletonTable";
import { UploadErrorsPanel } from "./UploadErrorsPanel";

const DebtPricingUpload: React.FC = () => {
  const { seriesIdParam } = useParams<{ seriesIdParam?: string }>();
  const seriesId = seriesIdParam ? Number(seriesIdParam) : undefined;

  const [error, setError] = useState<string[] | null>(null);

  const columns = useDebtPricingColumns();
  const { rows, setRows, isLoading } = useDebtPricingLoader(seriesId);
  const handleUpload = useDebtPricingUpload({
    columns,
    seriesId,
    setRows,
    setError,
  });

  const handleDownload = useCallback(() => {
    downloadExcelTemplate(
      "DebtPricingTemplate.xlsx",
      "Debt Pricing",
      columns.map((c) => c.label),
      rows.map((r) => columns.map((c) => (r as any)[c.key])),
    );
  }, [columns, rows]);

  return (
    <div className="space-y-8">
      <h3 className="text-gray-700 text-3xl font-semibold">
        Debt Pricing Upload
      </h3>
      <div className="mt-2 w-full h-1 bg-gray-300 rounded-full" />

      <UploadBar onUpload={handleUpload} onDownload={handleDownload} />

      {error && <UploadErrorsPanel errors={error} />}

      {isLoading ? (
        <SkeletonTable columnCount={columns.length} rowCount={6} />
      ) : rows.length === 0 ? (
        <div className="text-gray-500">
          No data loaded. Please upload a file to get started.
        </div>
      ) : (
        <DataTable columns={columns as any} rows={rows} />
      )}
    </div>
  );
};

export default DebtPricingUpload;
