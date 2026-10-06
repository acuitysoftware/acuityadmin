import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FiSave, FiXCircle, FiUser, FiImage, FiUploadCloud, FiTrash2, FiRefreshCw, FiAlignLeft, FiStar, FiBriefcase } from "react-icons/fi";

export const getTestimonialImageUrl = (item) => {
  if (!item) return null;
  if (typeof File !== "undefined" && item instanceof File) return URL.createObjectURL(item);
  if (typeof item === "string") {
    if (/^(https?:|blob:|data:)/i.test(item)) return item;
    return `https://acuitynew.acuitysoftware.co.in/api/storage/app/public/${item.replace(/^\//, "")}`;
  }
  if (item.image_path) return item.image_path;
  return item.image ? getTestimonialImageUrl(item.image) : null;
};

export default function TestimonialModal({ isOpen, onClose, onSubmit, initial, loading }) {
  const [form, setForm] = useState({ name: "", designation: "", description: "", rating: "5" });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ name: initial?.name || "", designation: initial?.designation || "", description: initial?.description || "", rating: initial?.rating == null ? "5" : String(initial.rating) });
    setImage(null);
    setPreviewUrl(getTestimonialImageUrl(initial));
    setErrors({});
  }, [initial, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select a valid image file." }));
      event.target.value = "";
      return;
    }
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.designation.trim()) nextErrors.designation = "Designation is required.";
    if (!form.description.trim()) nextErrors.description = "Testimonial description is required.";
    if (!form.rating) nextErrors.rating = "Rating is required.";
    if (!initial && !image) nextErrors.image = "Testimonial image is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit({
      id: initial?.id,
      name: form.name.trim(),
      designation: form.designation.trim(),
      description: form.description.trim(),
      rating: form.rating,
      image,
      existingImage: initial?.image || initial?.image_path || null,
    });
  };

  const fieldClass = (field) => `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/40 ${errors[field] ? "border-rose-400" : "border-slate-200"}`;

  return <>
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
    <div className={`fixed top-0 right-0 h-full w-full sm:max-w-lg bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center"><FiStar /></div><div><h2 className="text-lg font-bold text-slate-800">{initial ? "Edit Testimonial" : "Add New Testimonial"}</h2><p className="text-xs text-slate-400">{initial ? "Update testimonial details and image" : "Add a customer testimonial"}</p></div></div>
        <button onClick={onClose} type="button" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><RxCross1 size={20} /></button>
      </div>
      <form id="testimonial-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-5">
        <div><label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2"><FiUser className="text-orange-500" /> Name <span className="text-rose-500">*</span></label><input name="name" value={form.name} onChange={handleChange} placeholder="Customer name" className={fieldClass("name")} />{errors.name && <p className="mt-1.5 text-xs text-rose-500">{errors.name}</p>}</div>
        <div><label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2"><FiBriefcase className="text-orange-500" /> Designation <span className="text-rose-500">*</span></label><input name="designation" value={form.designation} onChange={handleChange} placeholder="Role, company" className={fieldClass("designation")} />{errors.designation && <p className="mt-1.5 text-xs text-rose-500">{errors.designation}</p>}</div>
        <div><label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2"><FiAlignLeft className="text-orange-500" /> Testimonial <span className="text-rose-500">*</span></label><textarea name="description" rows={5} value={form.description} onChange={handleChange} placeholder="Write the testimonial" className={`${fieldClass("description")} resize-y`} />{errors.description && <p className="mt-1.5 text-xs text-rose-500">{errors.description}</p>}</div>
        <div><label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2"><FiStar className="text-orange-500" /> Rating <span className="text-rose-500">*</span></label><select name="rating" value={form.rating} onChange={handleChange} className={`${fieldClass("rating")} cursor-pointer`}><option value="">Select rating</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} {value === 1 ? "star" : "stars"}</option>)}</select>{errors.rating && <p className="mt-1.5 text-xs text-rose-500">{errors.rating}</p>}</div>
        <div>
          <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"><span className="flex items-center gap-2"><FiImage className="text-orange-500" /> Image {!initial && <span className="text-rose-500">*</span>}</span>{previewUrl && <label className="text-[11px] text-orange-600 font-semibold cursor-pointer hover:underline flex items-center gap-1"><FiRefreshCw className="text-[10px]" /> Change Image<input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label>}</label>
          {previewUrl ? <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between"><div className="flex items-center gap-3 overflow-hidden"><img src={previewUrl} alt="Testimonial preview" className="w-14 h-14 object-cover rounded-lg bg-white border border-slate-200" onError={(e) => { e.currentTarget.style.display = "none"; }} /><div className="truncate"><p className="text-xs font-semibold text-slate-700 truncate">{image?.name || "Testimonial Image"}</p><p className="text-[11px] text-slate-400">{image ? `${(image.size / 1024).toFixed(1)} KB` : "Click 'Change Image' to pick a new file"}</p></div></div><button type="button" onClick={() => { setImage(null); setPreviewUrl(null); }} className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100" title="Remove image"><FiTrash2 /></button></div> : <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center group ${errors.image ? "border-rose-400 bg-rose-50/20" : "border-slate-200 hover:border-orange-400 bg-slate-50/50"}`}><FiUploadCloud className="text-3xl mb-2 text-slate-400 group-hover:text-orange-500" /><span className="text-xs font-bold text-slate-700">Click to upload testimonial image</span><span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP or SVG</span><input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label>}{errors.image && <p className="mt-1.5 text-xs text-rose-500">{errors.image}</p>}
        </div>
      </form>
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-2"><FiXCircle /> Cancel</button><button form="testimonial-form" type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50">{loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FiSave />}{initial ? "Update Testimonial" : "Create Testimonial"}</button></div>
    </div>
  </>;
}
