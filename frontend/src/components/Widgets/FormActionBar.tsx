import React from "react";
import { FormSubmitButton } from "./FormSubmitButton";

interface FormActionBarProps {
  seriesId?: number;
  onSkip?: () => void;
  submitLabel?: string;
}

export const FormActionBar = ({
  seriesId,
  onSkip,
  submitLabel,
}: FormActionBarProps) => {
  return (
    <div
      className="
        mt-8 flex items-center justify-between
        rounded-lg border border-gray-200
        bg-gray-50 px-6 py-4
        shadow-sm
      "
    >
      {/* Left side */}
      <div>
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
              hover:bg-gray-100 hover:cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-gray-200
            "
          >
            Skip to Pricing
          </button>
        )}
      </div>

      {/* Right side */}
      <FormSubmitButton label={submitLabel} />
    </div>
  );
};
