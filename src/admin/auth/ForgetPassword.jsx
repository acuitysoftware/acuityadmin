import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthLayout from "./AuthLayout";
import Field from "./Field";
import { checkForgotPasswordOtp, forgotPassword, resetPassword } from "../../api/auth";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      if (response?.status === false) {
        throw new Error(response.message || "Could not send a verification code.");
      }
      toast.success(response?.message || "A verification code has been sent to your email.");
      setOtp("");
      setOtpOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not send a verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await checkForgotPasswordOtp({ email: email.trim(), otp: otp.trim() });
      if (response?.status === false) {
        throw new Error(response.message || "The verification code could not be confirmed.");
      }
      toast.success(response?.message || "Verification code confirmed.");
      setOtpOpen(false);
      setStep("reset");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "The verification code could not be confirmed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      if (response?.status === false) {
        throw new Error(response.message || "Could not reset your password.");
      }
      toast.success(response?.message || "Password reset successfully.");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout
        active="forgot-password"
        title={step === "reset" ? "Set a new password" : "Forgot password?"}
        subtitle={
          step === "reset"
            ? "Choose a new password for your account."
            : "Enter your email and we’ll send you a verification code."
        }
        showSocial={false}
      >
        {step === "email" ? (
          <form onSubmit={handleRequestOtp}>
            <Field
              label="Your email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@acuitysoftwareservices.com"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[var(--color-gold)] text-white font-heading font-bold text-base hover:brightness-95 transition disabled:opacity-60"
            >
              {loading ? "Sending code…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p className="mb-4 text-sm text-slate-600">
              Resetting password for <span className="font-semibold text-primary">{email}</span>
            </p>
            <Field
              label="New password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              required
            />
            <Field
              label="Confirm new password"
              type="password"
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              placeholder="Re-enter your new password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[var(--color-gold)] text-white font-heading font-bold text-base hover:brightness-95 transition disabled:opacity-60"
            >
              {loading ? "Updating password…" : "Reset password"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-body/70">
          Remembered your password?{" "}
          <Link to="/admin/login" className="font-semibold text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>

      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-modal-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <h2 id="otp-modal-title" className="font-heading text-2xl font-extrabold text-primary">
              Verify your email
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the verification code sent to <span className="font-semibold">{email}</span>.
            </p>
            <form onSubmit={handleVerifyOtp} className="mt-6">
              <label htmlFor="forgot-password-otp" className="mb-2 block text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="forgot-password-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-body outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                placeholder="Enter your code"
              />
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOtpOpen(false)}
                  disabled={loading}
                  className="h-12 flex-1 rounded-xl border border-slate-200 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 flex-1 rounded-xl bg-[var(--color-gold)] font-heading font-bold text-white transition hover:brightness-95 disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Verify code"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
