import React from "react";

// Labeled input used by both Login and Register forms.
export default function Field({ label, type = "text", value, onChange, placeholder, required, right }) {
  return (
    <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 block mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full border rounded-lg bg-white text-body px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
        />
        {right && <div className="absolute inset-y-0 right-2 flex items-center">{right}</div>}
      </div>
    </div>
  );
}
