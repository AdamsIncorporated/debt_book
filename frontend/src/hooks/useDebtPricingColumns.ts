import { useMemo } from "react";
import {
  excelDateToJSONString,
  excelNumberToJSONNumber,
} from "../utils/func";
import { DebtPricing } from "../Constants/Constants";

type DebtPricingUploadRow = Omit<DebtPricing, "id"> & { id?: number };

type ColumnDef<K extends keyof DebtPricingUploadRow> = {
  label: string;
  key: K;
  align?: "right";
  format?: "number" | "m/dd/yyyy";
  parse?: (raw: unknown) => DebtPricingUploadRow[K];
  fallback?: DebtPricingUploadRow[K];
};

const isBlank = (v: unknown) => v === null || v === undefined || v === "";

export const useDebtPricingColumns = () =>
  useMemo<ColumnDef<keyof DebtPricingUploadRow>[]>(() => {
    const parseOptionalNumber = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelNumberToJSONNumber(raw) as any;
    };

    const parseOptionalDate = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelDateToJSONString(raw) as any;
    };

    const parseRequiredNumber = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelNumberToJSONNumber(raw) as any;
    };

    return [
      {
        label: "Id",
        key: "id",
        parse: parseOptionalNumber,
        fallback: undefined,
      },
      {
        label: "Maturity Date",
        key: "maturity_date",
        format: "m/dd/yyyy",
        parse: parseOptionalDate,
        fallback: undefined,
      },
      {
        label: "Amount",
        key: "amount",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Coupon Rate",
        key: "coupon_rate",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Yield Rate",
        key: "yield_rate",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Price",
        key: "price",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Premium/Discount",
        key: "premium_discount",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
    ];
  }, []);
