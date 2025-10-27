"use client";

export default function InputField({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder,
  required = false 
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-brand-dark font-medium text-base">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary transition-colors duration-200 text-brand-dark"
      />
    </div>
  );
}

