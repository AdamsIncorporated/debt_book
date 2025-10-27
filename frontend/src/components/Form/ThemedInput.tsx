import React from "react";


interface ThemedInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const ThemedInput: React.FC<ThemedInputProps> = ({
    placeholder = "Issuer Name",
    value = "",
    onChange,
}) => {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="w-full border border-gray-200  px-4 py-2 text-gray-500 placeholder-slate-400 outline-none transition-all duration-300 focus:border-sky-400 focus:bg-gray-50 focus:ring-2 focus:ring-sky-500"
        />
    );
};

export default ThemedInput;
