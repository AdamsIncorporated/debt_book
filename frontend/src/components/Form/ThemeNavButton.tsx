import React from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";

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
        className="flex-1 flex items-center justify-center gap-2 border border-sky-700 bg-white px-4 py-2 font-semibold transition-all duration-300 hover:bg-sky-700 hover:text-white hover:cursor-pointer"
      >
        <IoIosArrowRoundBack />
        Back
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex-1 flex items-center justify-center gap-2 border border-sky-700 bg-white px-4 py-2 font-semibold transition-all duration-300 hover:bg-sky-700 hover:text-white hover:cursor-pointer"
      >
        Next
        <IoMdArrowForward />
      </button>
    </div>
  );
}

export default ThemeNavButton;
