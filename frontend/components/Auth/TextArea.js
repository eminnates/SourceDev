"use client";

export default function TextArea({ 
  label, 
  value, 
  onChange, 
  placeholder,
  maxLength,
  required = false,
  rows = 3 
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-brand-dark font-medium text-base">
        {label}
        {maxLength && (
          <span className="text-brand-muted text-sm ml-2">
            ({value?.length || 0}/{maxLength})
          </span>
        )}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        rows={rows}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary transition-colors duration-200 text-brand-dark resize-none"
      />
    </div>
  );
}

