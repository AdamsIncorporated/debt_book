import React from "react";

interface FormSubmitButtonProps {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const FormSubmitButton = ({
  label = "Submit",
  loading = false,
  disabled = false,
}: FormSubmitButtonProps) => {
  return (
    <div className="mt-6 flex justify-end">
      <button
        type="submit"
        disabled={disabled || loading}
        className={`
          inline-flex items-center gap-2 rounded-md
          bg-gray-800 px-6 py-2.5 text-sm font-medium text-white
          shadow-md transition
          hover:bg-gray-900 hover:shadow-lg hover:cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-gray-400
          disabled:cursor-not-allowed disabled:bg-gray-400
        `}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {loading ? "Submitting…" : label}
      </button>
    </div>
  );
};
