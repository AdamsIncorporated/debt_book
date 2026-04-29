import React from "react";

type Props = {
  label?: string;
  onClick: () => void;
};

export function FancyDownloadButton({
  label = "Download Template",
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-2 px-5 py-3
        rounded-xl bg-white text-gray-700 font-medium
        shadow-md hover:bg-gray-100 active:scale-95
        transition-all border border-gray-200 cursor-pointer
      "
    >
      ⬇️ {label}
    </button>
  );
}
