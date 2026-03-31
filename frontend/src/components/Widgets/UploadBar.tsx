import React from "react";
import { FancyUploadButton } from "./FancyUploadButton";
import { FancyDownloadButton } from "./FancyDownloadButton";

type Props = {
  onUpload: (file: File) => void;
  onDownload: () => void;
};

export function UploadBar({ onUpload, onDownload }: Props) {
  return (
    <div className="flex items-center gap-4 w-full">
      <FancyUploadButton
        label="Upload Excel Pricing Schedule"
        onUpload={onUpload}
      />
      <FancyDownloadButton
        label="Download Template"
        onClick={onDownload}
      />
    </div>
  );
}