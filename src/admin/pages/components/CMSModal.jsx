import React, { useState, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import {
  FiSave,
  FiXCircle,
  FiType,
  FiLink,
  FiAlignLeft,
  FiFileText,
  FiSearch,
  FiTag,
  FiInfo,
} from "react-icons/fi";
import SimpleEditor from "./SimpleEditor";

const CMSModal = ({ isOpen, onClose, onSubmit, initial }) => {
  const [formData, setFormData] = useState({
    page_title: "",
    page_url: "",
    short_description: "",
    long_description: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  // Populate form if editing
  useEffect(() => {
    if (initial) {
      setFormData({
        page_title: initial.page_title || "",
        page_url: initial.page_url || "",
        short_description: initial.short_description || "",
        long_description: initial.long_description || "",
        meta_title: initial.meta_title || "",
        meta_description: initial.meta_description || "",
        meta_keywords: initial.meta_keywords || "",
      });
    } else {
      // Reset form for adding
      setFormData({
        page_title: "",
        page_url: "",
        short_description: "",
        long_description: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
      });
    }
  }, [initial, isOpen]);

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-generate slug from page title
  const handleTitleChange = (e) => {
    const value = e.target.value;
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({
      ...prev,
      page_title: value,
      page_url: initial ? prev.page_url : slug, // Only auto-generate slug if it's a new entry
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call & Optimistic UI update
    onSubmit(formData);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-lg bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            {initial ? <FiFileText className="text-blue-600" /> : <FiFileText className="text-blue-600" />}
            {initial ? "Edit Page" : "Add New Page"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RxCross1 size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Title */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FiType /> Page Title *
            </label>
            <input
              type="text"
              name="page_title"
              value={formData.page_title}
              onChange={handleTitleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter page title"
            />
          </div>

          {/* Page URL */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FiLink /> Page URL *
            </label>
            <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <span className="pl-4 pr-2 text-gray-400 text-sm">/</span>
              <input
                type="text"
                name="page_url"
                value={formData.page_url}
                onChange={handleChange}
                required
                className="w-full py-2 pr-4 outline-none border-none rounded-r-md"
                placeholder="page-url"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FiAlignLeft /> Short Description *
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Enter short description"
            />
          </div>

          {/* Long Description (Rich Text) */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FiFileText /> Long Description
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              {/* Quill Toolbar Styles Override to match Tailwind container */}
              <style>{`
                .ql-toolbar { border: none; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
                .ql-container { border: none; font-family: inherit; }
                .ql-editor { min-height: 150px; font-size: 14px; }
              `}</style>

              <SimpleEditor
                value={formData.long_description}
                onChange={(html) => setFormData((prev) => ({ ...prev, long_description: html }))}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <FiSearch className="text-blue-600" /> SEO & Meta
            </h3>

            {/* Meta Title */}
            <div className="mb-4">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
                <FiInfo /> Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter meta title"
              />
            </div>

            {/* Meta Description */}
            <div className="mb-4">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
                <FiAlignLeft /> Meta Description
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Enter meta description"
              />
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
                <FiTag /> Meta Keywords
              </label>
              <input
                type="text"
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter meta keywords (comma separated)"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
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
            <FiSave /> {initial ? "Update Page" : "Save Page"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CMSModal;