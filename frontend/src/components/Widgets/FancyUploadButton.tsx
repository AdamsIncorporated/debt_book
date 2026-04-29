import React from "react";

type Props = {
  label?: string;
  onUpload: (file: File) => void;
};

export function FancyUploadButton({ label = "Upload File", onUpload }: Props) {
  return (
    <label
      className="
        inline-flex items-center gap-3 px-5 py-3
        rounded-xl bg-white text-gray-700 font-medium
        shadow-md cursor-pointer
        hover:bg-gray-100 active:scale-95
        transition-all border border-gray-200
      "
    >
      📄 {label}
      <input
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </label>
  );
}
