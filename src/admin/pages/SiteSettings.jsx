import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiImage, FiLoader, FiSave, FiUploadCloud } from "react-icons/fi";
import { applySiteFavicon, getSiteSettings, updateSiteSettings } from "../../api/site";

const EMPTY_SETTINGS = {
  email: "",
  phone: "",
  address: "",
  footer_text: "",
  site_title: "",
  copy_right_text: "",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

function TextField({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}{required && <span className="ml-1 text-red-500">*</span>}
      <input
        className={inputClass}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </label>
  );
}

function ImageUpload({ label, name, currentUrl, file, onChange }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const imageUrl = previewUrl || currentUrl;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex min-h-28 items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
          {imageUrl ? (
            <img src={imageUrl} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
          ) : (
            <FiImage className="text-2xl text-slate-300" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600">
            <FiUploadCloud aria-hidden="true" /> Choose image
            <input
              className="sr-only"
              type="file"
              name={name}
              accept="image/*"
              onChange={(event) => onChange(name, event.target.files?.[0] || null)}
            />
          </label>
          <p className="mt-2 truncate text-xs text-slate-500">
            {file?.name || (currentUrl ? "Current image" : "PNG, JPG, SVG or ICO")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SiteSettings() {
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [images, setImages] = useState({ logo: null, favicon: null });
  const [imagePaths, setImagePaths] = useState({ logo: "", favicon: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setLoadError("Your admin session was not found. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await getSiteSettings(token);
        if (!response?.status) throw new Error(response?.message || "Could not load site settings.");
        const data = response.data || {};
        if (!active) return;
        setSettings({
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          footer_text: data.footer_text || "",
          site_title: data.site_title || "",
          copy_right_text: data.copy_right_text || "",
        });
        setImagePaths({ logo: data.logo_path || "", favicon: data.favicon_path || "" });
        applySiteFavicon(data.favicon_path);
        setLoadError("");
      } catch (error) {
        if (!active) return;
        setLoadError(error.response?.data?.message || error.message || "Could not load site settings.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setSettings((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (name, file) => {
    setImages((current) => ({ ...current, [name]: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Your admin session expired. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...settings };
      if (images.logo) payload.logo = images.logo;
      if (images.favicon) payload.favicon = images.favicon;
      const response = await updateSiteSettings(token, payload);
      if (response?.status === false) throw new Error(response.message || "Could not update site settings.");

      const returnedData = response?.data || {};
      setImagePaths((current) => ({
        logo: returnedData.logo_path || current.logo,
        favicon: returnedData.favicon_path || current.favicon,
      }));
      applySiteFavicon(returnedData.favicon_path || imagePaths.favicon);
      setImages({ logo: null, favicon: null });
      toast.success(response?.message || "Site settings updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not update site settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl pb-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">Website configuration</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Site Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage contact details, branding, and footer content.</p>
      </div>

      {loadError && (
        <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <button type="button" className="font-semibold underline" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
          <FiLoader className="mr-2 animate-spin" aria-hidden="true" /> Loading site settings…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-base font-bold text-slate-900">Site information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Site title" name="site_title" value={settings.site_title} onChange={handleFieldChange} required />
              <TextField label="Email" name="email" value={settings.email} onChange={handleFieldChange} type="email" required />
              <TextField label="Phone" name="phone" value={settings.phone} onChange={handleFieldChange} type="tel" required />
              <TextField label="Address" name="address" value={settings.address} onChange={handleFieldChange} required />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-base font-bold text-slate-900">Branding</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <ImageUpload label="Logo" name="logo" currentUrl={imagePaths.logo} file={images.logo} onChange={handleImageChange} />
              <ImageUpload label="Favicon" name="favicon" currentUrl={imagePaths.favicon} file={images.favicon} onChange={handleImageChange} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-base font-bold text-slate-900">Footer</h2>
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Footer text
                <textarea className={`${inputClass} min-h-28 resize-y`} name="footer_text" value={settings.footer_text} onChange={handleFieldChange} placeholder="Enter footer text" />
              </label>
              <TextField label="Copyright text" name="copy_right_text" value={settings.copy_right_text} onChange={handleFieldChange} />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving || Boolean(loadError)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <FiLoader className="animate-spin" aria-hidden="true" /> : <FiSave aria-hidden="true" />}
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
