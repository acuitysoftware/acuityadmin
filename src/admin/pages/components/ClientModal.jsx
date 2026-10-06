import React, { useState, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import {
  FiSave,
  FiXCircle,
  FiType,
  FiImage,
  FiCheckCircle,
  FiUploadCloud,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";

export const getClientImageUrl = (item) => {
  if (!item) return null;
  if (item instanceof File) return URL.createObjectURL(item);
  if (typeof item === "string") {
    if (item.startsWith("http://") || item.startsWith("https://") || item.startsWith("blob:") || item.startsWith("data:")) {
      return item;
    }
    return `https://acuitynew.acuitysoftware.co.in/api/storage/app/public/${item.replace(/^\//, "")}`;
  }

  if (item.image_path) return item.image_path;
  if (item.logo_path) return item.logo_path;

  const raw = item.image || item.logo;
  if (!raw) return null;
  if (typeof raw === "string") {
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:") || raw.startsWith("data:")) {
      return raw;
    }
    return `https://acuitynew.acuitysoftware.co.in/api/storage/app/public/${raw.replace(/^\//, "")}`;
  }
  return null;
};

export default function ClientModal({ isOpen, onClose, onSubmit, initial, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    status: "1",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  // Populate & prefill form values when opening/editing
  useEffect(() => {
    if (initial) {
      const existingName = initial.name || initial.title || initial.client_name || "";
      const rawStatus = initial.status;
      const normalizedStatus =
        rawStatus === "0" || rawStatus === 0 || rawStatus === false || rawStatus === "inactive"
          ? "0"
          : "1";

      const existingImage = getClientImageUrl(initial);

      setFormData({
        name: existingName,
        status: normalizedStatus,
        image: null,
      });
      setPreviewUrl(existingImage);
    } else {
      setFormData({
        name: "",
        status: "1",
        image: null,
      });
      setPreviewUrl(null);
    }
    setErrors({});
  }, [initial, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Please select a valid image file." }));
        return;
      }
      setErrors((prev) => ({ ...prev, image: "" }));
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewUrl(null);
    setErrors((prev) => ({ ...prev, image: "Client logo image is required." }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Client name is required.";
    }
    if (!formData.status && formData.status !== 0) {
      newErrors.status = "Status is required.";
    }
    if (!formData.image && !previewUrl) {
      newErrors.image = "Client logo image is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    onSubmit({
      id: initial?.id,
      name: formData.name.trim(),
      status: formData.status,
      image: formData.image,
      existingImage: initial?.image || initial?.image_path || null,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in Modal Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <FiImage />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {initial ? "Edit Client" : "Add New Client"}
              </h2>
              <p className="text-xs text-slate-400">
                {initial ? "Modify client details and update logo" : "Upload logo and set client details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RxCross1 size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Client Name Input */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2">
              <FiType className="text-orange-500" /> Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corporation"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 outline-none transition-all ${
                errors.name
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1 animate-fade-in">
                {errors.name}
              </p>
            )}
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2">
              <FiCheckCircle className="text-orange-500" /> Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 outline-none transition-all cursor-pointer ${
                errors.status
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              }`}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
            {errors.status && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1 animate-fade-in">
                {errors.status}
              </p>
            )}
          </div>

          {/* Logo Image Preview & Upload Field */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              <span className="flex items-center gap-2">
                <FiImage className="text-orange-500" /> Client Logo Image <span className="text-rose-500">*</span>
              </span>
              {previewUrl && (
                <label className="text-[11px] text-orange-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                  <FiRefreshCw className="text-[10px]" /> Change Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </label>

            {previewUrl ? (
              <div className={`relative rounded-xl border p-3 flex items-center justify-between group ${
                errors.image ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-slate-50"
              }`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-14 h-14 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {formData.image ? formData.image.name : "Client Logo"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formData.image
                        ? `${(formData.image.size / 1024).toFixed(1)} KB`
                        : "Click 'Change Logo' to pick a new file"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                  title="Remove image"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center group ${
                errors.image
                  ? "border-rose-400 bg-rose-50/20 hover:bg-rose-50/30"
                  : "border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-orange-50/30"
              }`}>
                <FiUploadCloud className={`text-3xl mb-2 transition-colors ${
                  errors.image ? "text-rose-400" : "text-slate-400 group-hover:text-orange-500"
                }`} />
                <span className="text-xs font-bold text-slate-700">Click to upload client logo</span>
                <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP or SVG (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.image && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1 animate-fade-in">
                {errors.image}
              </p>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <FiXCircle /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <FiSave />
            )}
            {initial ? "Update Client" : "Create Client"}
          </button>
        </div>
      </div>
    </>
  );
}
