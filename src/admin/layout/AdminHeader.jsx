import React from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { FiExternalLink, FiUser } from "react-icons/fi";

export default function AdminHeader({ company, onMenuClick }) {
  return (
    <header className="h-16 bg-[#0e1b3d] text-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <HiMenuAlt2 />
        </button>
        <img
          src={`${import.meta.env.BASE_URL}assets/images/white_logo.png`}
          alt={company?.name || "Acuity"}
          className="h-12 w-auto max-w-[180px] object-contain"
        />
      </div>
      <div className="flex items-center gap-3 sm:gap-4 text-sm shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white"
        >
          View Site <FiExternalLink />
        </a>
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm">
          <FiUser />
        </div>
      </div>
    </header>
  );
}