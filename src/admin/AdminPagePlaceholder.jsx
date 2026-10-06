import React from "react";

// Generic placeholder shell used by every admin page until its real form
// is wired up to the API. Keeps consistent title/description styling.
export default function AdminPagePlaceholder({ title, description, children }) {
  return (
    <div className="max-w-4xl w-full">
      <h1 className="text-lg sm:text-xl font-bold text-[#0e1b3d] mb-1">{title}</h1>
      {description && <p className="text-sm text-slate-500 mb-6">{description}</p>}
      <div className="bg-white border rounded-lg p-4 sm:p-6 overflow-x-auto">
        {children || (
          <p className="text-sm text-slate-400 italic">
            Form coming soon — this page will be built out once the API is ready.
          </p>
        )}
      </div>
    </div>
  );
}
