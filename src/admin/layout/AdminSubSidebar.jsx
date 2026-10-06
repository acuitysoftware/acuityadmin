import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  FiLayout,
  FiMaximize2,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";

export const HOME_SUBMENUS = [
  { id: "clients", to: "/admin/home-settings/clients", label: "Clients", Icon: FiUsers, badge: "Live" },
  { id: "services", to: "/admin/home-settings/services", label: "Services", Icon: FiLayers, badge: "Live" },
  { id: "projects", to: "/admin/home-settings/projects", label: "Projects", Icon: FiBriefcase, badge: "Live" },
  { id: "solutions", to: "/admin/home-settings/solutions", label: "Solutions", Icon: FiBriefcase, badge: "Live" },
  { id: "about", to: "/admin/home-settings/about", label: "About", Icon: FiInfo, badge: "Soon" },
  { id: "techstack", to: "/admin/home-settings/techstack", label: "TechStack", Icon: FiCpu, badge: "Live" },
  { id: "industries", to: "/admin/home-settings/industries", label: "Industries", Icon: FiGlobe, badge: "Live" },
  { id: "process", to: "/admin/home-settings/process", label: "Process", Icon: FiGitPullRequest, badge: "Soon" },
  { id: "portfolio", to: "/admin/home-settings/portfolio", label: "Portfolio", Icon: FiGrid, badge: "Soon" },
  { id: "testimonials", to: "/admin/home-settings/testimonials", label: "Testimonials", Icon: FiMessageSquare, badge: "Live" },
  { id: "cta-settings", to: "/admin/home-settings/cta-settings", label: "CTA Settings", Icon: FiSliders, badge: "Soon" },
];

export const MENU_SUBMENUS = [
  { id: "header", to: "/admin/menu-settings/header", label: "Header Management", Icon: FiLayout },
  { id: "footer", to: "/admin/menu-settings/footer", label: "Footer Management", Icon: FiMaximize2 },
];

export const PROFILE_SUBMENUS = [
  { id: "change-password", to: "/admin/change-password", label: "Change Password", Icon: FiLock },
];

export default function AdminSubSidebar({ onNavigate, collapsed, onToggleCollapse }) {
  const location = useLocation();

  let title = "";
  let items = [];

  if (location.pathname.startsWith("/admin/home-settings")) {
    title = "Home Settings";
    items = HOME_SUBMENUS;
  } else if (location.pathname.startsWith("/admin/menu-settings")) {
    title = "Menu Settings";
    items = MENU_SUBMENUS;
  } else if (location.pathname.startsWith("/admin/change-password")) {
    title = "Profile";
    items = PROFILE_SUBMENUS;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className={`bg-[#132247] text-white flex flex-col shrink-0 h-[calc(100vh-4rem)] lg:h-full border-l border-r border-white/10 shadow-2xl transition-all duration-300 relative z-10 ${
        collapsed ? "w-12" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3.5 border-b border-white/10 bg-[#0e1b3d]/50">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
              {title}
            </h2>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors mx-auto"
          title={collapsed ? `Expand ${title} menu` : `Collapse ${title} menu`}
          aria-label={collapsed ? `Expand ${title} menu` : `Collapse ${title} menu`}
        >
          {collapsed ? <FiChevronRight className="text-base" /> : <FiChevronLeft className="text-base" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
        {items.map(({ to, label, Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center px-2" : ""}`
            }
          >
            <Icon className="text-base shrink-0 transition-transform group-hover:scale-110" />
            {!collapsed && <span className="flex-1 truncate">{label}</span>}
            {!collapsed && badge && (
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                  badge === "Live"
                    ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                    : "bg-amber-400/20 text-amber-300 border-amber-400/30"
                }`}
              >
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {!collapsed && (
        <div className="p-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between bg-[#0e1b3d]/30">
          <span className="truncate">{items.length} Subtabs</span>
          <span className="flex items-center gap-1 text-slate-400">
            <FiClock className="text-[10px]" /> Sub Sidebar
          </span>
        </div>
      )}
    </aside>
  );
}
