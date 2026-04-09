import React from "react";

type ReadOnlyFieldProps = {
  label: string;
  value: React.ReactNode;
};

export const ReadOnlyField = ({ label, value }: ReadOnlyFieldProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-800">{label}</label>
      <div className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300">
        {value}
      </div>
    </div>
  );
};