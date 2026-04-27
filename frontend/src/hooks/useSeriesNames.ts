// hooks/useSeriesNames.ts
import { useEffect, useState } from "react";
import { get } from "../utils/func";
import { GET_ALL_SERIES_NAMES } from "../Constants/Constants";

export const useSeriesNames = () => {
  const [seriesNames, setSeriesNames] = useState<string[]>([]);
  const [seriesNamesLoaded, setSeriesNamesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    get(GET_ALL_SERIES_NAMES)
      .then((res) => {
        if (!mounted) return;

        if (res.status === 200 && Array.isArray(res.data)) {
          setSeriesNames(
            res.data.map((x: any) => String(x.series_name ?? "").trim()),
          );
        } else {
          setSeriesNames([]); // ✅ empty is valid
        }
      })
      .catch(() => {
        if (mounted) setSeriesNames([]); // ✅ still valid
      })
      .finally(() => {
        if (mounted) setSeriesNamesLoaded(true); // ✅ key line
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { seriesNames, seriesNamesLoaded };
};
