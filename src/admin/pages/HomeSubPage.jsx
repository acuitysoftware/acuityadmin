import React from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  FiUsers,
  FiLayers,
  FiBriefcase,
  FiInfo,
  FiCpu,
  FiGlobe,
  FiGitPullRequest,
  FiGrid,
  FiMessageSquare,
  FiSliders,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCode,
} from "react-icons/fi";

const SUBPAGE_DETAILS = {
  clients: {
    title: "Clients Settings",
    description: "Manage client logos, testimonials links, and client showcase order on the homepage.",
    Icon: FiUsers,
    color: "from-blue-500 to-indigo-600",
    mockItems: ["Acme Corp", "TechNova", "Starlight Systems", "Nexus Global"],
  },
  services: {
    title: "Services Settings",
    description: "Configure service cards, icons, features lists, and detail modals displayed on the homepage.",
    Icon: FiLayers,
    color: "from-emerald-500 to-teal-600",
    mockItems: ["Cloud Infrastructure", "UI/UX Product Design", "AI & Data Solutions", "Custom Software Development"],
  },
  projects: {
    title: "Projects Settings",
    description: "Manage project descriptions, showcase images, and homepage visibility.",
    Icon: FiBriefcase,
    color: "from-orange-500 to-amber-600",
    mockItems: ["Restaurant Ordering System", "Customer Portal", "Analytics Dashboard"],
  },
  solutions: {
    title: "Solutions Settings",
    description: "Tailor enterprise solution blocks, key benefits, and solution highlights for visitors.",
    Icon: FiBriefcase,
    color: "from-purple-500 to-violet-600",
    mockItems: ["Digital Transformation", "Legacy Modernization", "Automated QA Frameworks"],
  },
  about: {
    title: "About Section Settings",
    description: "Edit company mission statement, core statistics, values, and leadership highlight card.",
    Icon: FiInfo,
    color: "from-amber-500 to-orange-600",
    mockItems: ["Company Overview", "Key Milestones", "Core Values Grid"],
  },
  techstack: {
    title: "TechStack Settings",
    description: "Manage tech stack categories, skill badges, framework logos, and proficiency levels.",
    Icon: FiCpu,
    color: "from-cyan-500 to-blue-600",
    mockItems: ["Frontend Stack (React/Next)", "Backend Stack (Node/Python)", "Cloud & DevOps (AWS/Azure)"],
  },
  industries: {
    title: "Industries Settings",
    description: "Configure industry verticals (Fintech, Healthcare, E-Commerce, SaaS) targeted on homepage.",
    Icon: FiGlobe,
    color: "from-rose-500 to-pink-600",
    mockItems: ["Fintech & Banking", "Healthcare & Life Sciences", "E-Commerce & Retail"],
  },
  process: {
    title: "Process Settings",
    description: "Customize step-by-step development process workflow timeline and deliverable badges.",
    Icon: FiGitPullRequest,
    color: "from-indigo-500 to-purple-600",
    mockItems: ["Step 1: Discovery & Planning", "Step 2: Architecture & Design", "Step 3: Agile Execution", "Step 4: Launch & Scale"],
  },
  portfolio: {
    title: "Portfolio Settings",
    description: "Feature recent case studies, project screenshots, client outcomes, and live URLs.",
    Icon: FiGrid,
    color: "from-sky-500 to-indigo-600",
    mockItems: ["Fintech Platform Redesign", "AI Healthcare Assistant", "Global Logistics Dashboard"],
  },
  testimonials: {
    title: "Testimonials Settings",
    description: "Manage client reviews, avatar images, video testmonial links, and star ratings.",
    Icon: FiMessageSquare,
    color: "from-teal-500 to-emerald-600",
    mockItems: ["Sarah Jenkins - VP Product", "David Ross - CTO", "Elena Rostova - Founder"],
  },
  "cta-settings": {
    title: "CTA Settings",
    description: "Configure Call-To-Action banner text, primary/secondary buttons, and form triggers.",
    Icon: FiSliders,
    color: "from-orange-500 to-amber-600",
    mockItems: ["Header Callout Banner", "Mid-Page Contact CTA", "Footer Consultation Box"],
  },
};

export default function HomeSubPage() {
  const { subId } = useParams();
  const location = useLocation();

  // Infer slug if subId missing
  const activeSlug = subId || location.pathname.split("/").pop() || "clients";
  const detail = SUBPAGE_DETAILS[activeSlug] || {
    title: `${activeSlug.toUpperCase()} Settings`,
    description: "Manage homepage settings for this section.",
    Icon: FiCode,
    color: "from-slate-600 to-slate-800",
    mockItems: ["Default Configuration Item 1", "Default Configuration Item 2"],
  };

  const { title, description, Icon, color, mockItems } = detail;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} text-white flex items-center justify-center text-2xl shadow-lg shrink-0`}>
            <Icon />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Home Submenu
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                <FiClock className="text-xs" /> API Pending
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Prominent Coming Soon Alert Banner */}
      <div className="bg-gradient-to-r from-[#0e1b3d] to-[#1a2f66] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold tracking-wide border border-orange-500/30">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              API Under Development
            </div>
            <h2 className="text-lg font-bold text-white">Form Coming Soon</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Right now, the API endpoints for <strong>{title}</strong> are being finalized. Once connected, this page will provide full live control to edit, reorder, add, and disable content directly on your website.
            </p>
          </div>
          <div className="shrink-0 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-300 font-medium flex items-center gap-2">
            <FiCheckCircle className="text-emerald-400 text-base" /> Submenu Active
          </div>
        </div>
      </div>

      {/* Mock Layout / Preview of Upcoming Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Preview Layout Structure</h3>
            <p className="text-xs text-slate-500">Visual mock of items that will be managed via API</p>
          </div>
          <button
            type="button"
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-sm font-medium cursor-not-allowed border border-slate-200"
          >
            <FiPlus /> Add New Item (Disabled)
          </button>
        </div>

        {/* Mock Items Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between group opacity-75"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">{item}</h4>
                  <span className="text-[11px] text-slate-400">Status: Pending API Hook</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <button type="button" disabled className="p-1.5 rounded hover:bg-slate-200 text-slate-400">
                  <FiEdit className="text-sm" />
                </button>
                <button type="button" disabled className="p-1.5 rounded hover:bg-slate-200 text-slate-400">
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
