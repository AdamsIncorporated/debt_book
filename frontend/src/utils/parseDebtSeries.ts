// utils/parseDebtSeries.ts
import { DebtSeries } from "../Constants/Constants";

export type FormState = {
  id: number;
  seriesName: string;
  structure: string;
  isTaxExempt: boolean;
  costOfIssuance: string;
  useOfProceeds: string;
};

export const parseDebtSeries = (form: FormState): DebtSeries => {
  const rawCost = form.costOfIssuance.trim();
  const cost = rawCost === "" ? 0 : Number(rawCost);

  return {
    id: form.id || null,
    series_name: form.seriesName,
    structure: form.structure,
    is_tax_exempt: Number(form.isTaxExempt),
    cost_of_issuance: cost,
    use_of_proceeds: form.useOfProceeds,
    created_at: new Date().toISOString(),
  };
};
