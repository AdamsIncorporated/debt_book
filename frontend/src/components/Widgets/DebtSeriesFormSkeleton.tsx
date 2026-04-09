import React from "react";

const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const DebtSeriesFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-2xl shadow-lg">
      {/* Series Name */}
      <SkeletonLine className="h-4 w-32" />
      <SkeletonLine className="h-10 w-full" />

      {/* Par Amount */}
      <SkeletonLine className="h-4 w-28" />
      <SkeletonLine className="h-10 w-full" />

      {/* Premium */}
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className="h-10 w-full" />

      {/* Cost of Issuance */}
      <SkeletonLine className="h-4 w-36" />
      <SkeletonLine className="h-10 w-full" />

      {/* Tax Exempt Checkbox */}
      <div className="flex items-center gap-2">
        <SkeletonLine className="h-4 w-4" />
        <SkeletonLine className="h-4 w-24" />
      </div>
    </div>
  );
};

export default DebtSeriesFormSkeleton;
