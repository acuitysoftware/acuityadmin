import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import Field from "./Field";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      const msg = "Please fill in all fields.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (form.password.length < 8) {
      const msg = "Password must be at least 8 characters.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (form.password !== form.confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real API call once ready, e.g.:
      // const res = await fetch("/api/admin/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      // });
      // if (!res.ok) throw new Error("Could not create account.");

      toast.success("Account created — please sign in.");
      navigate("/admin/login");
    } catch (err) {
      const msg = err.message || "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout active="register" title="Create Account" subtitle="Sign up to get started!">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <Field label="Full name" value={form.name} onChange={set("name")} placeholder="Paul D'Souza" required />

        <Field
          label="Your email"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@acuitysoftwareservices.com"
          required
        />

        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={set("password")}
          placeholder="At least 8 characters"
          required
          right={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-body/40 hover:text-body/70 text-lg"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          }
        />

        <Field
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Re-enter your password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 mt-3 rounded-2xl bg-gold text-white font-heading font-bold text-base hover:brightness-95 transition disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Continue"}
        </button>
      </form>
    </AuthLayout>
  );
}