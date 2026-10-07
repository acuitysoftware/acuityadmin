import { useEffect, useState } from "react";
import { FiFileText, FiLink, FiSave, FiSearch, FiTag, FiType, FiX } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import SimpleEditor from "./SimpleEditor";

const emptyForm = {
  page_name: "",
  page_url: "",
  description: "",
  short_description: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
};

export default function CMSModal({ initial, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

  useEffect(() => {
    setForm(initial ? {
      page_name: initial.page_name || initial.name || "",
      page_url: initial.page_url || initial.slug || "",
      description: initial.description || "",
      short_description: initial.short_description || "",
      seo_title: initial.seo_title || "",
      seo_description: initial.seo_description || "",
      seo_keywords: initial.seo_keywords || "",
    } : emptyForm);
    setErrors({});
  }, [initial]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: "" }));
  };
  const submit = (event) => {
    event.preventDefault();
    const descriptionText = form.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    const nextErrors = {};
    if (!form.page_name.trim()) nextErrors.page_name = "Page name is required.";
    if (!form.page_url.trim()) nextErrors.page_url = "Page URL is required.";
    if (!form.short_description.trim()) nextErrors.short_description = "Short description is required.";
    if (!descriptionText) nextErrors.description = "Description is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit({ ...form, page_name: form.page_name.trim(), page_url: form.page_url.trim() });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800"><FiFileText className="text-orange-500" />{initial ? "Edit CMS Page" : "Add CMS Page"}</h2>
            <p className="mt-1 text-xs text-slate-400">Manage page content, URL, and search metadata.</p>
          </div>
          <button type="button" disabled={loading} onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><RxCross1 /></button>
        </div>

        <form id="cms-form" noValidate onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiType className="text-orange-500" /> Page Name *</span>
            <input name="page_name" value={form.page_name} onChange={change} className={`${input} ${errors.page_name ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-400/30" : ""}`} placeholder="e.g. About Us" aria-invalid={Boolean(errors.page_name)} aria-describedby={errors.page_name ? "cms-name-error" : undefined} />
            {errors.page_name && <p id="cms-name-error" className="mt-1.5 text-xs font-medium text-rose-500">{errors.page_name}</p>}
          </div>
          <div className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiLink className="text-orange-500" /> Page URL *</span>
            <input name="page_url" value={form.page_url} onChange={change} className={`${input} ${errors.page_url ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-400/30" : ""}`} placeholder="https://example.com/about-us" aria-invalid={Boolean(errors.page_url)} aria-describedby={errors.page_url ? "cms-url-error" : undefined} />
            {errors.page_url && <p id="cms-url-error" className="mt-1.5 text-xs font-medium text-rose-500">{errors.page_url}</p>}
          </div>
          <div className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 block">Short Description *</span>
            <textarea name="short_description" rows={3} value={form.short_description} onChange={change} className={`${input} ${errors.short_description ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-400/30" : ""}`} aria-invalid={Boolean(errors.short_description)} aria-describedby={errors.short_description ? "cms-short-description-error" : undefined} />
            {errors.short_description && <p id="cms-short-description-error" className="mt-1.5 text-xs font-medium text-rose-500">{errors.short_description}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Description *</label>
            <div className={`overflow-hidden rounded-xl border focus-within:ring-2 ${errors.description ? "border-rose-400 bg-rose-50/20 focus-within:ring-rose-400/30" : "border-slate-200 focus-within:ring-orange-500/30"}`}>
              <SimpleEditor value={form.description} onChange={(description) => {
                setForm((previous) => ({ ...previous, description }));
                if (errors.description) setErrors((previous) => ({ ...previous, description: "" }));
              }} />
            </div>
            {errors.description && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.description}</p>}
          </div>
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-primary"><FiSearch className="text-orange-500" /> SEO Settings</h3>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">SEO Title<input name="seo_title" value={form.seo_title} onChange={change} className={`${input} mt-1.5`} /></label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">SEO Description<textarea name="seo_description" rows={3} value={form.seo_description} onChange={change} className={`${input} mt-1.5`} /></label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700"><span className="mb-1.5 flex items-center gap-2"><FiTag className="text-orange-500" /> SEO Keywords</span><input name="seo_keywords" value={form.seo_keywords} onChange={change} className={input} placeholder="Comma separated" /></label>
          </div>
        </form>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-5">
          <button type="button" disabled={loading} onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
          <button form="cms-form" type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
            {initial ? "Update Page" : "Create Page"}
          </button>
        </div>
      </div>
    </>
  );
}
