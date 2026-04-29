import { useEffect, useState } from "react";
import { customFetch } from "../utils/api";
import { DebtService, getSeriesDebtServiceById } from "../Constants/Constants";

export const useDebtServiceLoader = (seriesId?: number) => {
  const [rows, setRows] = useState<DebtService[]>([]);
  const [originalRows, setOriginalRows] = useState<DebtService[]>([]);
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

    customFetch<DebtService[]>({
      endpoint: getSeriesDebtServiceById(seriesId),
      entityName: "Debt Series Service",
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
