"use client";

export default function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-4 h-4 border-2 border-gray-300 rounded bg-white peer-checked:bg-brand-primary peer-checked:border-brand-primary flex items-center justify-center transition-all duration-200">
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
      </div>
      <span className="text-brand-dark text-base select-none">
        {label}
      </span>
    </label>
  );
}

