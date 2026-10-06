import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import Field from "./Field";
import { adminLogin } from "../../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      const msg = "Please enter both email and password.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      const token =
        data?.token ??
        data?.access_token ??
        data?.data?.token ??
        data?.data?.access_token;
      if (!token) throw new Error("The login response did not include an authentication token.");

      localStorage.setItem("admin_token", token);

      toast.success(data?.message || "Signed in successfully.");
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout active="login" title="Welcome," subtitle="Sign in to continue!">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <Field
          label="Your email or username"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@acuitysoftwareservices.com"
          required
        />

        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
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

        <div className="flex items-center justify-between mb-5 text-sm">
          <label className="flex items-center gap-2 text-body/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-gray-300 accent-accent"
            />
            Remember me
          </label>
          <a href="#" className="text-accent font-medium hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[var(--color-gold)] text-white font-heading font-bold text-base hover:brightness-95 transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </AuthLayout>
  );
}
