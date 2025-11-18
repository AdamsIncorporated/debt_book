import React from "react";

interface ThemeNavButtonProps {
  onBack: () => void;
  onNext: () => void;
}

const ThemeNavButton: React.FC<ThemeNavButtonProps> = ({ onBack, onNext }) => {
  return (
    <div className="flex w-full gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex-1 rounded-lg border border-sky-700 bg-white px-4 py-2 font-semibold transition-all duration-300 hover:bg-sky-700 hover:text-white"
      >
        Back
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex-1 rounded-lg bg-white px-4 py-2 font-semibold transition-all duration-300 hover:bg-sky-600 active:bg-sky-800 focus:ring-2 focus:ring-sky-500"
      >
        Next
      </button>
    </div>
  );
}

export default ThemeNavButton;