import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    toast.info("Password changes are not connected yet.");
  };

  const passwordField = (name, label, value) => (
    <label className="block mb-5">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">
        <input
          type={showPasswords ? "text" : "password"}
          className={inputClass}
          value={value}
          onChange={update(name)}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
          required
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
    </label>
  );

  return (
    <section className="mx-auto w-full max-w-4xl">
      <header className="mb-6 text-center">
        <h1 className="mb-1 text-lg font-bold text-[#0e1b3d] sm:text-xl">Change Password</h1>
        <p className="text-sm text-slate-500">Choose a new password for your administrator account.</p>
      </header>
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
        {passwordField("currentPassword", "Current password", form.currentPassword)}
        {passwordField("newPassword", "New password", form.newPassword)}
        {passwordField("confirmPassword", "Confirm new password", form.confirmPassword)}
        <p className="mb-5 text-xs text-slate-500">Use at least 8 characters for your new password.</p>
        <button type="submit" className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">
          Update Password
        </button>
      </form>
      </div>
    </section>
  );
}
