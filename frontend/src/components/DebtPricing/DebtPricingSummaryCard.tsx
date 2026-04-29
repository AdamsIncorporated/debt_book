import React, { useMemo } from "react";
import { DebtPricing } from "../../Constants/Constants";

type Props = {
  rows: DebtPricing[];
};

export default function DebtPricingSummaryCard({ rows }: Props) {
  const summary = useMemo(() => {
    let totalPar = 0;
    let weightedCoupon = 0;
    let weightedYield = 0;
    let weightedPrice = 0;
    let totalPremiumDiscount = 0;

    let minMaturity: Date | null = null;
    let maxMaturity: Date | null = null;

    for (const r of rows) {
      const par = Number(r.amount ?? 0) || 0;
      const coupon = Number(r.coupon_rate ?? 0);
      const ytm = Number(r.yield_rate ?? 0);
      const price = Number(r.price ?? 0);
      const premDisc = Number(r.premium_discount ?? 0) || 0;

      totalPar += par;
      weightedCoupon += coupon * par;
      weightedYield += ytm * par;
      weightedPrice += price * par;
      totalPremiumDiscount += premDisc;

      if (r.maturity_date) {
        const d = new Date(r.maturity_date);
        if (!Number.isNaN(d.getTime())) {
          if (!minMaturity) {
            minMaturity = d;
          } else if (d < minMaturity) {
            minMaturity = d;
          }

          if (!maxMaturity) {
            maxMaturity = d;
          } else if (d > maxMaturity) {
            maxMaturity = d;
          }
        }
      }
    }

    const count = rows.length;
    const avgCoupon = totalPar ? weightedCoupon / totalPar : 0;
    const avgYield = totalPar ? weightedYield / totalPar : 0;
    const avgPrice = totalPar ? weightedPrice / totalPar : 0;

    const today = new Date();
    const durationYears =
      minMaturity && maxMaturity
        ? (maxMaturity.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24 * 365)
        : null;

    return {
      count,
      totalPar,
      avgCoupon,
      avgYield,
      avgPrice,
      totalPremiumDiscount,
      maturityRange:
        minMaturity && maxMaturity
          ? `${minMaturity.toLocaleDateString()} → ${maxMaturity.toLocaleDateString()}`
          : "—",
      approxDuration: durationYears,
      tic: avgCoupon, // True Interest Cost (simplified weighted coupon proxy)
      nic: avgYield, // Net Interest Cost (simplified weighted yield proxy)
    };
  }, [rows]);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">
          Debt Pricing Summary
        </h4>
        <span className="text-sm text-gray-500">
          {summary.count} maturities
        </span>
      </div>

      {/* Core metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Total Par Amount" value={fmt(summary.totalPar)} />
        <Metric label="Weighted Avg Coupon" value={pct(summary.avgCoupon)} />
        <Metric label="Weighted Avg Yield (NIC)" value={pct(summary.nic)} />
      </div>

      {/* Price & cost metrics */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Weighted Avg Price" value={fmt(summary.avgPrice)} />
        <Metric
          label="Total Premium / (Discount)"
          value={fmt(summary.totalPremiumDiscount)}
        />
        <Metric label="TIC (Proxy)" value={pct(summary.tic)} />
      </div>

      {/* Structure metrics */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Maturity Range" value={summary.maturityRange} />
        <Metric
          label="Approx Duration (yrs)"
          value={
            summary.approxDuration != null
              ? summary.approxDuration.toFixed(2)
              : "—"
          }
        />
        <Metric label="Structure Count" value={String(summary.count)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}
