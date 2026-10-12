import { useEffect, useState } from "react";
import { FiLink, FiSave, FiShare2, FiType } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { SOCIAL_ICON_OPTIONS } from "./socialIcons";

const emptyForm = { name: "", link: "", icon: "" };

export default function SocialLinkModal({ initial, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial
      ? { name: initial.name || "", link: initial.link || "", icon: initial.icon || "" }
      : emptyForm);
    setErrors({});
  }, [initial]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Social network name is required.";
    if (!form.link.trim()) nextErrors.link = "Social link is required.";
    if (!form.icon) nextErrors.icon = "Please select an icon.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      ...(initial?.id != null ? { id: initial.id } : {}),
      name: form.name.trim(),
      link: form.link.trim(),
      icon: form.icon,
    });
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
  const selectedIcon = SOCIAL_ICON_OPTIONS.find((option) => option.value === form.icon);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
              <FiShare2 className="text-orange-500" />{initial ? "Edit Social Link" : "Add Social Link"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">Manage a social profile and its display icon.</p>
          </div>
          <button type="button" disabled={loading} onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close modal">
            <RxCross1 />
          </button>
        </div>

        <form id="social-link-form" noValidate onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6 font-body">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiType className="text-orange-500" /> Name *</span>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Facebook" className={`${inputClass} ${errors.name ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.name)} />
            {errors.name && <span className="mt-1.5 block text-xs font-medium text-rose-500">{errors.name}</span>}
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiLink className="text-orange-500" /> Link *</span>
            <input name="link" type="url" value={form.link} onChange={handleChange} placeholder="https://facebook.com/your-page" className={`${inputClass} ${errors.link ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.link)} />
            {errors.link && <span className="mt-1.5 block text-xs font-medium text-rose-500">{errors.link}</span>}
          </label>

          <div>
            <label htmlFor="social-icon" className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <FiShare2 className="text-orange-500" /> Icon *
            </label>
            <div className="flex items-center gap-3">
              <select id="social-icon" name="icon" value={form.icon} onChange={handleChange} className={`${inputClass} h-9 cursor-pointer py-1 ${errors.icon ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.icon)}>
                <option value="">Select a social icon</option>
                {SOCIAL_ICON_OPTIONS.map(({ name, value }) => <option key={value} value={value}>{name}</option>)}
              </select>
              {selectedIcon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600" aria-label={`${selectedIcon.name} icon`}>
                <selectedIcon.Icon />
              </span>}
            </div>
            {errors.icon && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.icon}</p>}
          </div>
        </form>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-5">
          <button type="button" disabled={loading} onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
          <button form="social-link-form" type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
            {initial ? "Update Social Link" : "Create Social Link"}
          </button>
        </div>
      </div>
    </>
  );
}
