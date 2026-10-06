import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FiSave, FiXCircle, FiType, FiLink, FiColumns } from "react-icons/fi";

// Pages available to link to from the footer. Swap this for a real CMS
// pages list (e.g. from your /admin/cms-settings data) once the API is ready.
const AVAILABLE_PAGES = [
  { label: "About Us", url: "/about" },
  { label: "Services", url: "/services" },
  { label: "Industries", url: "/industries" },
  { label: "Portfolio", url: "/portfolio" },
  { label: "Blog", url: "/blog" },
  { label: "Contact Us", url: "/contact" },
  { label: "Privacy Policy", url: "/privacy-policy" },
  { label: "Terms & Conditions", url: "/terms-conditions" },
];

const EMPTY_FORM = {
  label: "",
  linkType: "internal", // "internal" | "external"
  page: "",
  url: "",
  columnId: "",
};

// Slide-in panel for adding/editing a single footer link. `columns` is the
// list of footer columns (id + title) so the admin can pick/move which
// column this link belongs to.
export default function FooterLinkModal({ isOpen, onClose, onSubmit, initial, columns }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initial) {
      setForm({
        label: initial.label || "",
        linkType: initial.linkType || "internal",
        page: initial.linkType === "internal" ? initial.url || "" : "",
        url: initial.linkType === "external" ? initial.url || "" : "",
        columnId: initial.columnId ?? "",
      });
    } else {
      setForm({ ...EMPTY_FORM, columnId: columns?.[0]?.id ?? "" });
    }
  }, [initial, isOpen, columns]);

  const set = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handlePageSelect = (e) => {
    const url = e.target.value;
    const matched = AVAILABLE_PAGES.find((p) => p.url === url);
    setForm((f) => ({ ...f, page: url, label: f.label || matched?.label || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = form.linkType === "internal" ? form.page : form.url;
    if (!form.label || !url || form.columnId === "") return;
    onSubmit({
      label: form.label,
      linkType: form.linkType,
      url,
      columnId: Number(form.columnId),
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {initial ? "Edit Footer Link" : "Add Footer Link"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <RxCross1 size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Column */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FiColumns /> Footer Column *
            </label>
            <select
              value={form.columnId}
              onChange={set("columnId")}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="" disabled>Select a column</option>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Link type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Link Type *</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkType"
                  checked={form.linkType === "internal"}
                  onChange={() => setForm((f) => ({ ...f, linkType: "internal" }))}
                />
                Internal Page
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkType"
                  checked={form.linkType === "external"}
                  onChange={() => setForm((f) => ({ ...f, linkType: "external" }))}
                />
                External URL
              </label>
            </div>
          </div>

          {/* Page or URL */}
          {form.linkType === "internal" ? (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
                <FiLink /> Page *
              </label>
              <select
                value={form.page}
                onChange={handlePageSelect}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="" disabled>Select a page</option>
                {AVAILABLE_PAGES.map((p) => (
                  <option key={p.url} value={p.url}>{p.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
                <FiLink /> External URL *
              </label>
              <input
                type="text"
                value={form.url}
                onChange={set("url")}
                required
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          )}

          {/* Label */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FiType /> Link Label *
            </label>
            <input
              type="text"
              value={form.label}
              onChange={set("label")}
              required
              placeholder="Text shown in the footer"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex gap-4 justify-end">
          <button
            onClick={onClose}
            type="button"
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
          >
            <FiXCircle /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            <FiSave /> {initial ? "Update Link" : "Save Link"}
          </button>
        </div>
      </div>
    </>
  );
}