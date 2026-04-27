import { useEffect, useState } from "react";
import { get } from "../utils/func";
import { GET_ALL_SERIES_NAMES } from "../Constants/Constants";

export const useAllSeriesNames = () => {
  const [names, setNames] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const res = await get(GET_ALL_SERIES_NAMES);

        const normalizedNames = (res.data ?? [])
          .map((s: any) => s.series_name)
          .filter(Boolean)
          .map((n: string) => n.trim().toLowerCase());

        setNames(normalizedNames);
      } catch (err) {
        console.error("Failed to load series names", err);
        setNames([]);
      } finally {
        setLoaded(true);
      }
    };

    fetchNames();
  }, []);

  return { seriesNames: names, seriesNamesLoaded: loaded };
};
