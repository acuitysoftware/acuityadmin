import React from "react";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Are you sure you want to delete the selected item(s)? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  variant = "danger",
}) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-10 transform transition-all duration-300 scale-100 animate-scale-up">
        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <FiX size={18} />
        </button>

        {/* Header Icon + Content */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              isDanger
                ? "bg-rose-50 text-rose-500 border border-rose-100"
                : "bg-amber-50 text-amber-500 border border-amber-100"
            }`}
          >
            {isDanger ? <FiTrash2 /> : <FiAlertTriangle />}
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-slate-800 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${
              isDanger
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20"
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : isDanger ? (
              <FiTrash2 />
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
