import { useEffect, useState } from "react";
import { GET_ALL_SERIES } from "../Constants/Constants";
import { DebtSeries } from "../Constants/Constants";
import React from "react";
import { useNavigate } from "react-router-dom";

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 w-full rounded bg-gray-200" />
      </td>
    ))}
  </tr>
);

const formatCurrency = (value?: number) =>
  value !== undefined ? value.toLocaleString() : "—";

const DebtSeriesLandingTable: React.FC = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<DebtSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch(GET_ALL_SERIES);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSeries(await res.json());
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-3/4 py-10">
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "ID",
                  "Series",
                  "Structure",
                  "Tax Exempt",
                  "Issuance Cost",
                  "Use Of Proceeds",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto w-3/4 py-10">
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Series</th>
              <th className="px-4 py-3 text-left">Structure</th>
              <th className="px-4 py-3 text-left">Tax Exempt</th>
              <th className="px-4 py-3 text-left">Issuance Cost</th>
              <th className="px-4 py-3 text-left">Use of Proceeds</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {series.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3 font-medium">{s.series_name}</td>
                <td className="px-4 py-3 font-medium">{s.structure}</td>
                <td className="px-4 py-3">{s.is_tax_exempt ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(s.cost_of_issuance ?? 0)}
                </td>
                <td className="px-4 py-3 font-medium">{s.use_of_proceeds}</td>
                <td className="px-4 py-3">{s.created_at ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    className="px-4 py-2 shadow hover:bg-gray-200 rounded-md transition hover:cursor-pointer"
                    onClick={() => navigate(`/debt-series/${s.id}`)}
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}

            {series.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No series found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Create new */}
      <div className="my-4 flex justify-end">
        <button
          onClick={() => navigate("/debt-series/create-new-series")}
          className="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition hover:cursor-pointer"
        >
          ✨ Create New Series
        </button>
      </div>
    </div>
  );
};

export default DebtSeriesLandingTable;
