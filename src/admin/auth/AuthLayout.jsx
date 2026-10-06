import React from "react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// Shared shell for /admin/login and /admin/register — dark page, centered
// white card, Login / Sign Up toggle, heading, form (children) and social buttons.
export default function AuthLayout({ active, title, subtitle, children, showSocial = true }) {
  const socialBtn =
    "w-full h-14 rounded-2xl border border-gray-200 bg-white flex items-center justify-center gap-2 font-heading font-semibold text-primary hover:bg-surface transition";

  return (
    <div className="min-h-screen w-full bg-[var(--color-primary)] flex items-center justify-center px-4 py-10 font-body">
      <div className="w-full max-w-md bg-white rounded-[32px] p-5 sm:p-6 shadow-2xl">
        {/* Logo — use a dark/colour logo, since the card is white */}
        <div className="flex justify-center py-6">
          <img
            src="/assets/images/acuity_logo_without_bg.png"
            alt="Acuity logo"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-lg text-body/60">{subtitle}</p>}
        </div>

        {children}

        {showSocial && (
          <>
            <div className="my-4 text-center text-sm text-body/50">OR</div>
            {/* TODO: wire up Apple / Google auth */}
            <button type="button" className={`${socialBtn} mb-3`}>
              <FaApple className="text-xl text-black" /> Sign in with Apple
            </button>
            <button type="button" className={socialBtn}>
              <FcGoogle className="text-xl" /> Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
