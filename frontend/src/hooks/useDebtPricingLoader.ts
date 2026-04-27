import { useEffect, useState } from "react";
import { customFetch } from "../utils/api";
import { DebtPricing, getSeriesPricingById } from "../Constants/Constants";

export const useDebtPricingLoader = (seriesId?: number) => {
  const [rows, setRows] = useState<DebtPricing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (seriesId == null) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await customFetch<DebtPricing[]>({
          endpoint: getSeriesPricingById(seriesId),
          entityName: "Debt Series Pricing",
          mapResponse: (raw) => raw,
        });

        if (!alive) return;
        setRows(data?.length ? data : []);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [seriesId]);

  return { rows, setRows, isLoading };
};
