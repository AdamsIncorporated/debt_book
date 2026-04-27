// hooks/useDebtSeriesLoader.ts
import { useEffect, useState } from "react";
import { fetchById } from "../utils/api";

const MAX_LEN = 100;
const EMPTY_DEBT_SERIES_FORM = {
  seriesName: "",
  structure: "",
  isTaxExempt: false,
  costOfIssuance: "",
  useOfProceeds: "",
};

export const useDebtSeriesLoader = (seriesId?: string) => {
  const [form, setForm] = useState<any>(null);
  const [existingSeriesName, setExistingSeriesName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!seriesId) {
      setForm(EMPTY_DEBT_SERIES_FORM);
      setLoaded(true);
      return;
    }

    setLoaded(false);

    fetchById({
      endpoint: `/api/get/get_debt_series_by_id/${seriesId}`,
      entityName: "Debt Series",
      mapResponse: (raw: any) => {
        const s = Array.isArray(raw) ? raw[0] : raw;
        return {
          id: s?.id ?? 0,
          seriesName: String(s?.series_name ?? "").slice(0, MAX_LEN),
          structure: String(s?.structure ?? "").slice(0, MAX_LEN),
          isTaxExempt: !!s?.is_tax_exempt,
          costOfIssuance: String(s?.cost_of_issuance ?? ""),
          useOfProceeds: String(s?.use_of_proceeds ?? "").slice(0, MAX_LEN),
        };
      },
    }).then((data) => {
      setForm(data);
      setExistingSeriesName(data.seriesName);
      setLoaded(true);
    });
  }, [seriesId]);

  return { form, setForm, existingSeriesName, loaded };
};
``;
