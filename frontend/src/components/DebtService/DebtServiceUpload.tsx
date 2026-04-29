import React from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useCallback } from "react";
import { useDebtServiceColumns } from "../../hooks/useDebtServiceColumns";
import { useDebtServiceLoader } from "../../hooks/useDebtServiceLoader";
import { useDebtServiceUpload } from "../../hooks/useDebtServiceUpload";
import { downloadExcelTemplate } from "../../utils/func";
import { DataTable } from "../Widgets/DataTable";
import { UploadBar } from "../Widgets/UploadBar";
import { SkeletonTable } from "../Widgets/SkeletonTable";
import { UploadErrorsPanel } from "../Widgets/UploadErrorsPanel";
import { FormActionBar } from "../Widgets/FormActionBar";
import CsvUploadRules from "../Widgets/CsvUploadRules";
import {
  PATCH_DEBT_SERVICE,
  POST_DEBT_SERVICE,
  DELETE_DEBT_SERVICE,
} from "../../Constants/Constants";
import { submitWithDiff } from "../../utils/submitWithDiff";
import { toast } from "react-toastify";

const DebtServiceUpload: React.FC = () => {
  const { seriesIdParam } = useParams<{ seriesIdParam: string }>();
  const seriesId = Number(seriesIdParam);
  const navigate = useNavigate();

  const [error, setError] = useState<string[] | null>(null);

  const columns = useDebtServiceColumns();
  const { rows, setRows, isLoading, originalRows } =
    useDebtServiceLoader(seriesId);
  const handleUpload = useDebtServiceUpload({
    columns,
    seriesId,
    setRows,
    setError,
  });

  const handleDownload = useCallback(() => {
    downloadExcelTemplate(
      "DebtServiceTemplate.xlsx",
      "Debt Service",
      columns.map((c) => c.label),
      rows.map((r) => columns.map((c) => (r as any)[c.key])),
    );
  }, [columns, rows]);

  const handleSubmit = async () => {
    try {
      console.log("Submitting with diff", { originalRows, rows });
      await submitWithDiff({
        postUrl: POST_DEBT_SERVICE,
        patchUrl: PATCH_DEBT_SERVICE,
        deleteUrl: DELETE_DEBT_SERVICE,
        originalRows: originalRows,
        currentRows: rows,
        idKey: "id",
      });
      toast.success("Debt series updated successfully");
      navigate(`/`);
    } catch (err) {
      console.error("Submit failed", err);
      setError(["An unexpected error occurred during submission."]);
      return;
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-gray-700 text-3xl font-semibold">
        Debt Service Upload
      </h3>
      <CsvUploadRules />
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
        <form
          className="m-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DataTable columns={columns as any} rows={rows} />
          <FormActionBar
            seriesId={seriesId}
            onSkip={() => {
              navigate(`/`);
            }}
            submitLabel="Save Service"
          />
        </form>
      )}
    </div>
  );
};

export default DebtServiceUpload;
