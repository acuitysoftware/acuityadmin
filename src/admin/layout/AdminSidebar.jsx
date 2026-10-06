import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiSettings,
  FiGrid,
  FiHome,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiLock,
  FiLogOut,
  FiMoreVertical,
} from "react-icons/fi";

const PRIMARY_NAV = [
  { to: "/admin/site-settings", label: "Site Settings", Icon: FiSettings, hasSub: false },
  { to: "/admin/cms-settings", label: "CMS Settings", Icon: FiGrid, hasSub: false },
  { to: "/admin/home-settings/clients", matchPrefix: "/admin/home-settings", label: "Home Settings", Icon: FiHome, hasSub: true, subCount: 10 },
  { to: "/admin/menu-settings/header", matchPrefix: "/admin/menu-settings", label: "Menu Settings", Icon: FiMenu, hasSub: true, subCount: 2 },
  { to: "/admin/change-password", matchPrefix: "/admin/change-password", label: "Profile", Icon: FiUser, hasSub: true, subCount: 1 },
];

export default function AdminSidebar({
  onNavigate,
  collapsed,
  onToggleCollapse,
  sidebarWidth = 256,
  onWidthChange,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(sidebarWidth);

  const showLabels = !collapsed;

  const logout = () => {
    localStorage.removeItem("admin_token");
    onNavigate?.();
    navigate("/admin/login");
  };

  // Mouse Drag handlers for Sidebar resizing / collapse
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = collapsed ? 64 : sidebarWidth || 256;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartX.current;
      let newWidth = dragStartWidth.current + deltaX;

      // Restrict width range
      if (newWidth < 120) {
        if (!collapsed) onToggleCollapse?.(true);
      } else {
        if (collapsed) onToggleCollapse?.(false);
        const clampedWidth = Math.min(Math.max(newWidth, 180), 380);
        onWidthChange?.(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, collapsed, onToggleCollapse, onWidthChange]);

  return (
    <aside
      style={{ width: collapsed ? 64 : sidebarWidth }}
      className={`bg-[#0e1b3d] text-white flex flex-col shrink-0 h-[calc(100vh-4rem)] lg:h-full py-4 px-2 gap-1.5 shadow-2xl relative select-none transition-all ${
        isDragging ? "transition-none" : "duration-200"
      }`}
    >
      {/* Top Header & Arrow Collapse Button */}
      <div
        className={`mb-3 flex items-center px-1 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-orange-500/30 shrink-0">
              A
            </div>
            <span className="font-bold text-base tracking-wide text-white truncate">
              Acuity Admin
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => onToggleCollapse?.()}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiChevronLeft
            className={`text-lg transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {PRIMARY_NAV.map(({ to, matchPrefix, label, Icon, hasSub, subCount }) => {
          const isActive = matchPrefix
            ? location.pathname.startsWith(matchPrefix)
            : location.pathname === to;

          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="text-lg shrink-0 transition-transform group-hover:scale-110" />
              {showLabels && <span className="flex-1 truncate">{label}</span>}
              {showLabels && hasSub && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/15 text-slate-200 shrink-0">
                  {subCount}
                </span>
              )}
              {collapsed && isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-orange-400 rounded-r" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Logout at bottom */}
      <div className="pt-2 border-t border-white/10 mt-auto">
        <button
          type="button"
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <FiLogOut className="text-lg shrink-0" />
          {showLabels && <span>Logout</span>}
        </button>
      </div>

      {/* Draggable border indicator line & handle (Right Edge) */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-40 flex items-center justify-center group"
        title="Drag to collapse/expand sidebar (or click to toggle)"
      >
        {/* Vertical line indicator */}
        <div
          className={`w-1 h-full transition-colors ${
            isDragging
              ? "bg-orange-500 shadow-md shadow-orange-500/50"
              : "bg-white/10 group-hover:bg-orange-500/80"
          }`}
        />

        {/* Drag handle pill with red accent matching reference image */}
        <div
          onClick={(e) => {
            // If it was just a quick click on the handle pill, toggle collapse
            if (!isDragging) {
              e.stopPropagation();
              onToggleCollapse?.();
            }
          }}
          className={`absolute top-1/2 -translate-y-1/2 -right-2.5 w-6 h-12 rounded-full flex flex-col items-center justify-center shadow-lg transition-all border border-white/20 cursor-pointer ${
            collapsed
              ? "bg-rose-600 hover:bg-rose-500 text-white"
              : "bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white"
          }`}
        >
          {collapsed ? (
            <FiChevronRight className="text-sm font-bold animate-pulse" />
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span className="w-1 h-1 rounded-full bg-rose-400" />
              <span className="w-1 h-2 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-rose-400" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
