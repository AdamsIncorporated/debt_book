import { DebtService } from "Constants/Constants";
import React, { useMemo } from "react";

type Props = {
  rows: DebtService[];
};

export default function DebtServiceSummaryCard({ rows }: Props) {
  const summary = useMemo(() => {
    let principal = 0;
    let interest = 0;
    let peakPayment = 0;

    for (const r of rows) {
      const p = Number(r.principal ?? 0);
      const i = Number(r.interest ?? 0);
      const ds = p + i;

      principal += p;
      interest += i;
      peakPayment = Math.max(peakPayment, ds);
    }

    const totalDebtService = principal + interest;
    const count = rows.length;

    return {
      count,
      principal,
      interest,
      totalDebtService,
      avgPayment: count ? totalDebtService / count : 0,
      peakPayment,
      interestPct: totalDebtService ? (interest / totalDebtService) * 100 : 0,
    };
  }, [rows]);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-lg font-semibold">Debt Service Summary</h4>
        <span className="text-sm text-gray-500">{summary.count} payments</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Total Principal" value={fmt(summary.principal)} />
        <Metric label="Total Interest" value={fmt(summary.interest)} />
        <Metric
          label="Total Debt Service"
          value={fmt(summary.totalDebtService)}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Avg Payment" value={fmt(summary.avgPayment)} />
        <Metric label="Peak Payment" value={fmt(summary.peakPayment)} />
        <Metric
          label="Interest %"
          value={`${summary.interestPct.toFixed(1)}%`}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
