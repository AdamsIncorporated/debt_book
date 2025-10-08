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
            className="w-full rounded-xl border border-sky-700 bg-sky-950/40 px-4 py-2 text-white placeholder-slate-400 outline-none transition-all duration-300 focus:border-sky-400 focus:bg-sky-900/50 focus:ring-2 focus:ring-sky-500"
        />
    );
};

export default ThemedInput;
