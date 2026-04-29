import { useEffect, useState } from "react";
import { customFetch } from "../utils/api";
import { DebtPricing, getSeriesPricingById } from "../Constants/Constants";

export const useDebtPricingLoader = (seriesId?: number) => {
  const [rows, setRows] = useState<DebtPricing[]>([]);
  const [originalRows, setOriginalRows] = useState<DebtPricing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    if (seriesId == null) {
      setRows([]);
      setOriginalRows([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    customFetch<DebtPricing[]>({
      endpoint: getSeriesPricingById(seriesId),
      entityName: "Debt Series Pricing",
      mapResponse: (raw) => raw,
    })
      .then((data) => {
        if (!alive) return;
        setRows(data);
        setOriginalRows(data);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [seriesId]);

  return { rows, setRows, isLoading, originalRows };
};
