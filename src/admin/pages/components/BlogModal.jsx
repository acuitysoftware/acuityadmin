import { useEffect, useState } from "react";
import { FiAlignLeft, FiFileText, FiImage, FiSave, FiType, FiUploadCloud } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import SimpleEditor from "./SimpleEditor";

const emptyForm = { title: "", short_description: "", description: "", image: null };

function getExistingImageUrl(initial) {
  const image = initial?.image_path || initial?.image;
  if (!image) return "";
  if (/^(https?:|blob:|data:)/i.test(image)) return image;
  return `https://acuitynew.acuitysoftware.co.in/api/storage/app/public/${image.replace(/^\//, "")}`;
}

function hasDescriptionContent(description) {
  return description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

export default function BlogModal({ initial, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ? {
      title: initial.title || "",
      short_description: initial.short_description || "",
      description: initial.description || "",
      image: null,
    } : emptyForm);
    setPreviewUrl(getExistingImageUrl(initial));
    setErrors({});
  }, [initial]);

  useEffect(() => {
    if (!form.image) return undefined;
    const objectUrl = URL.createObjectURL(form.image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleImageChange = (event) => {
    const image = event.target.files?.[0];
    if (!image) return;
    if (!image.type.startsWith("image/")) {
      setErrors((previous) => ({ ...previous, image: "Please select a valid image file." }));
      event.target.value = "";
      return;
    }
    setForm((previous) => ({ ...previous, image }));
    setErrors((previous) => ({ ...previous, image: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Blog title is required.";
    if (!form.short_description.trim()) nextErrors.short_description = "Short description is required.";
    if (!hasDescriptionContent(form.description)) nextErrors.description = "Blog description is required.";
    if (!initial && !form.image) nextErrors.image = "Blog image is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = new FormData();
    if (initial?.id != null) payload.append("id", String(initial.id));
    payload.append("title", form.title.trim());
    payload.append("short_description", form.short_description.trim());
    payload.append("description", form.description.trim());
    if (form.image) {
      payload.append("image", form.image);
    } else if (initial?.image || initial?.image_path) {
      payload.append("image", initial.image || initial.image_path);
    }
    onSubmit(payload, initial?.id != null);
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-primary"><FiFileText className="text-orange-500" />{initial ? "Edit Blog" : "Add Blog"}</h2>
            <p className="mt-1 text-xs text-slate-400">Manage the article title, content, and cover image.</p>
          </div>
          <button type="button" disabled={loading} onClick={onClose} aria-label="Close modal" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><RxCross1 /></button>
        </div>

        <form id="blog-form" noValidate onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6 font-body">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiType className="text-orange-500" /> Blog Title *</span>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter blog title" className={`${inputClass} ${errors.title ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.title)} />
            {errors.title && <span className="mt-1.5 block text-xs font-medium text-rose-500">{errors.title}</span>}
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiAlignLeft className="text-orange-500" /> Short Description *</span>
            <textarea name="short_description" rows={3} value={form.short_description} onChange={handleChange} placeholder="Write a short summary" className={`${inputClass} resize-y ${errors.short_description ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.short_description)} />
            {errors.short_description && <span className="mt-1.5 block text-xs font-medium text-rose-500">{errors.short_description}</span>}
          </label>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700"><FiFileText className="text-orange-500" /> Description *</label>
            <div className={`overflow-hidden rounded-xl border focus-within:ring-2 ${errors.description ? "border-rose-400 focus-within:ring-rose-400/30" : "border-slate-200 focus-within:ring-orange-500/30"}`}>
              <SimpleEditor value={form.description} onChange={(description) => {
                setForm((previous) => ({ ...previous, description }));
                if (errors.description) setErrors((previous) => ({ ...previous, description: "" }));
              }} />
            </div>
            {errors.description && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.description}</p>}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700"><FiImage className="text-orange-500" /> Cover Image {!initial && <span className="text-rose-500">*</span>}</label>
            <div className={`flex flex-col gap-4 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center ${errors.image ? "border-rose-400 bg-rose-50/20" : "border-slate-300 bg-slate-50"}`}>
              <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:w-32">
                {previewUrl ? <img src={previewUrl} alt="Blog cover preview" className="h-full w-full object-contain" /> : <FiImage className="text-2xl text-slate-300" aria-hidden="true" />}
              </div>
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600">
                  <FiUploadCloud aria-hidden="true" /> Choose image
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
                <p className="mt-2 text-xs text-slate-500">{form.image?.name || (previewUrl ? "Current blog image" : "PNG, JPG, WEBP or SVG")}</p>
                {errors.image && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.image}</p>}
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-5">
          <button type="button" disabled={loading} onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
          <button form="blog-form" type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
            {initial ? "Update Blog" : "Create Blog"}
          </button>
        </div>
      </div>
    </>
  );
}
