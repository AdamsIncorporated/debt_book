import { useMemo } from "react";
import { excelDateToJSONString, excelNumberToJSONNumber } from "../utils/func";
import { DebtService } from "../Constants/Constants";

type DebtServiceUploadRow = Omit<DebtService, "id"> & { id?: number };

type ColumnDef<K extends keyof DebtServiceUploadRow> = {
  label: string;
  key: K;
  align?: "right";
  format?: "number" | "m/dd/yyyy";
  parse?: (raw: unknown) => DebtServiceUploadRow[K];
  fallback?: DebtServiceUploadRow[K];
};

const isBlank = (v: unknown) => v === null || v === undefined || v === "";

export const useDebtServiceColumns = () =>
  useMemo(() => {
    const parseOptionalNumber = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelNumberToJSONNumber(raw) as any;
    };

    const parseRequiredDate = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelDateToJSONString(raw) as any;
    };

    const parseRequiredNumber = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelNumberToJSONNumber(raw) as any;
    };

    const columns: ColumnDef<keyof DebtServiceUploadRow>[] = [
      {
        label: "Id",
        key: "id",
        parse: parseOptionalNumber,
        fallback: undefined,
      },
      {
        label: "Payment Date",
        key: "payment_date",
        format: "m/dd/yyyy",
        parse: parseRequiredDate,
        fallback: undefined,
      },
      {
        label: "Principal",
        key: "principal",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Interest",
        key: "interest",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
    ];

    return columns;
  }, []);
