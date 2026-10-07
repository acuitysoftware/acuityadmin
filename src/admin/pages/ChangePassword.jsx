import { useState } from "react";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { resetPassword } from "../../api/auth";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

export default function ChangePassword() {
  const [form, setForm] = useState({ email: "", password: "", password_confirmation: "" });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
    if (field === "password" && errors.password_confirmation) {
      setErrors((current) => ({ ...current, password_confirmation: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "New password is required.";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!form.password_confirmation) nextErrors.password_confirmation = "Password confirmation is required.";
    else if (form.password !== form.password_confirmation) nextErrors.password_confirmation = "Password confirmation does not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const response = await resetPassword({
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      if (response?.status === false) throw new Error(response.message || "Could not reset password.");
      toast.success(response?.message || "Password updated successfully.");
      setForm((current) => ({ ...current, password: "", password_confirmation: "" }));
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  const passwordField = (name, label, value) => (
    <div className="mb-5">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">
        <input
          type={showPasswords ? "text" : "password"}
          className={`${inputClass} ${errors[name] ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-400/30" : ""}`}
          value={value}
          onChange={update(name)}
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPasswords((visible) => !visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
        >
          {showPasswords ? <FiEyeOff /> : <FiEye />}
        </button>
      </span>
      {errors[name] && <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-rose-500">{errors[name]}</p>}
    </div>
  );

  return (
    <section className="mx-auto w-full max-w-4xl">
      <header className="mb-6 text-center">
        <h1 className="mb-1 text-lg font-bold text-[#0e1b3d] sm:text-xl">Change Password</h1>
        <p className="text-sm text-slate-500">Choose a new password for your administrator account.</p>
      </header>
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-4 sm:p-6">
        <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-xl">
          <div className="mb-5">
            <span className="mb-2 block text-sm font-medium text-slate-700">Account email</span>
            <input type="email" className={`${inputClass} ${errors.email ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-400/30" : ""}`} value={form.email} onChange={update("email")} autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
            {errors.email && <p id="email-error" className="mt-1.5 text-xs font-medium text-rose-500">{errors.email}</p>}
          </div>
          {passwordField("password", "New password", form.password)}
          {passwordField("password_confirmation", "Confirm new password", form.password_confirmation)}
          <p className="mb-5 text-xs text-slate-500">Use at least 8 characters for your new password.</p>
          <button type="submit" disabled={loading} className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </section>
  );
}
