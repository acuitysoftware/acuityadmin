import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FiSave, FiXCircle, FiType, FiImage, FiUploadCloud, FiTrash2, FiAlignLeft, FiRefreshCw } from "react-icons/fi";

export const getProjectImageUrl = (item) => {
  if (!item) return null;
  if (typeof File !== "undefined" && item instanceof File) return URL.createObjectURL(item);
  if (typeof item === "string") {
    if (/^(https?:|blob:|data:)/i.test(item)) return item;
    return `https://acuitynew.acuitysoftware.co.in/api/storage/app/public/${item.replace(/^\//, "")}`;
  }
  if (item.image_path) return item.image_path;
  return item.image ? getProjectImageUrl(item.image) : null;
};

export default function ProjectModal({ isOpen, onClose, onSubmit, initial, loading }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setImage(null);
    setPreviewUrl(getProjectImageUrl(initial));
    setErrors({});
  }, [initial, isOpen]);

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
    if (!title.trim()) nextErrors.title = "Project title is required.";
    if (!description.trim()) nextErrors.description = "Project description is required.";
    if (!initial && !image) nextErrors.image = "Project image is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit({ id: initial?.id, title: title.trim(), description: description.trim(), image });
  };

  return <>
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
    <div className={`fixed top-0 right-0 h-full w-full sm:max-w-lg bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center"><FiImage /></div><div><h2 className="text-lg font-bold text-slate-800">{initial ? "Edit Project" : "Add New Project"}</h2><p className="text-xs text-slate-400">{initial ? "Update project details and showcase image" : "Create a project and upload its image"}</p></div></div>
        <button onClick={onClose} type="button" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><RxCross1 size={20} /></button>
      </div>
      <form id="project-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-5">
        <div><label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2"><FiType className="text-orange-500" /> Project Title <span className="text-rose-500">*</span></label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Restaurant Ordering System (NexOrdr)" className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/40 ${errors.title ? "border-rose-400" : "border-slate-200"}`} />{errors.title && <p className="mt-1.5 text-xs text-rose-500">{errors.title}</p>}</div>
        <div><label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 gap-2"><FiAlignLeft className="text-orange-500" /> Description <span className="text-rose-500">*</span></label><textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the project" className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 outline-none resize-y focus:ring-2 focus:ring-orange-500/40 ${errors.description ? "border-rose-400" : "border-slate-200"}`} />{errors.description && <p className="mt-1.5 text-xs text-rose-500">{errors.description}</p>}</div>
        <div>
          <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            <span className="flex items-center gap-2"><FiImage className="text-orange-500" /> Project Image {!initial && <span className="text-rose-500">*</span>}</span>
            {previewUrl && <label className="text-[11px] text-orange-600 font-semibold cursor-pointer hover:underline flex items-center gap-1"><FiRefreshCw className="text-[10px]" /> Change Image<input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label>}
          </label>
          {previewUrl ? <div className={`relative rounded-xl border p-3 flex items-center justify-between group ${errors.image ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-3 overflow-hidden"><img src={previewUrl} alt="Project preview" className="w-14 h-14 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-sm" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = "none"; }} /><div className="truncate"><p className="text-xs font-semibold text-slate-700 truncate">{image ? image.name : "Project Image"}</p><p className="text-[11px] text-slate-400">{image ? `${(image.size / 1024).toFixed(1)} KB` : "Click 'Change Image' to pick a new file"}</p></div></div>
            <button type="button" onClick={() => { setImage(null); setPreviewUrl(null); setErrors((prev) => ({ ...prev, image: !initial ? "Project image is required." : "" })); }} className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Remove image"><FiTrash2 size={16} /></button>
          </div> : <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center group ${errors.image ? "border-rose-400 bg-rose-50/20 hover:bg-rose-50/30" : "border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-orange-50/30"}`}><FiUploadCloud className={`text-3xl mb-2 transition-colors ${errors.image ? "text-rose-400" : "text-slate-400 group-hover:text-orange-500"}`} /><span className="text-xs font-bold text-slate-700">Click to upload project image</span><span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP or SVG</span><input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label>}
          {errors.image && <p className="mt-1.5 text-xs text-rose-500">{errors.image}</p>}
        </div>
      </form>
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-2"><FiXCircle /> Cancel</button><button form="project-form" type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50">{loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FiSave />}{initial ? "Update Project" : "Create Project"}</button></div>
    </div>
  </>;
}
