import React from "react";
import { FormSubmitButton } from "./FormSubmitButton";

interface FormActionBarProps {
  seriesId?: number;
  onBackwards?: () => void;
  onSkip?: () => void;
  submitLabel?: string;
}

export const FormActionBar = ({
  seriesId,
  onBackwards,
  onSkip,
  submitLabel,
}: FormActionBarProps) => {
  return (
    <div
      className="
        mt-8 flex items-center justify-between
        rounded-xl border border-gray-200
        bg-gray-50 px-6 py-4
        shadow-sm
      "
    >
      <div className="grid w-full grid-cols-3 items-center">
        {/* Left */}
        <div className="flex justify-start">
          {seriesId && onBackwards && (
            <button
              type="button"
              onClick={onBackwards}
              className="
          inline-flex items-center
          rounded-md border border-gray-300
          bg-white px-4 py-2
          text-sm font-medium text-gray-700
          shadow-sm transition
          hover:bg-gray-100
          hover:cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-gray-200
        "
            >
              ⬅️ Back to last Section
            </button>
          )}
        </div>

        {/* Center */}
        <div className="flex justify-center">
          {seriesId && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="
          inline-flex items-center
          rounded-md border border-gray-300
          bg-white px-4 py-2
          text-sm font-medium text-gray-700
          shadow-sm transition
          hover:bg-gray-100
          hover:cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-gray-200
        "
            >
              Skip to next Section ➡️
            </button>
          )}
        </div>

        {/* Right */}
        <div className="flex justify-end">
          <FormSubmitButton label={submitLabel} />
        </div>
      </div>
    </div>
  );
};
