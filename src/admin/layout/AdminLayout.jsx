import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminSubSidebar from "./AdminSubSidebar";

export default function AdminLayout({ company }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [primaryCollapsed, setPrimaryCollapsed] = useState(false);
  const [subSidebarCollapsed, setSubSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const initialPixelRatio = useRef(null);
  const [zoomCompensation, setZoomCompensation] = useState(1);

  useEffect(() => {
    initialPixelRatio.current = window.devicePixelRatio || 1;

    const matchInitialZoom = () => {
      const currentPixelRatio = window.devicePixelRatio || 1;
      setZoomCompensation(initialPixelRatio.current / currentPixelRatio);
    };

    window.addEventListener("resize", matchInitialZoom);
    return () => window.removeEventListener("resize", matchInitialZoom);
  }, []);

  return (
    <div style={{ zoom: zoomCompensation }} className="h-screen flex flex-col overflow-hidden bg-slate-100">
      <AdminHeader company={company} onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* Backdrop for mobile/tablet when sidebar drawer is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container (Primary + Sub Sidebar) */}
        <div
          className={
            "fixed lg:static inset-y-0 left-0 top-16 lg:top-0 z-30 flex transition-transform duration-200 shrink-0 " +
            (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
          }
        >
          {/* Primary Sidebar */}
          <AdminSidebar
            onNavigate={() => setSidebarOpen(false)}
            collapsed={primaryCollapsed}
            onToggleCollapse={(forceState) =>
              setPrimaryCollapsed((prev) => (forceState !== undefined ? forceState : !prev))
            }
            sidebarWidth={sidebarWidth}
            onWidthChange={setSidebarWidth}
          />

          {/* Secondary Sub Side-bar */}
          <AdminSubSidebar
            onNavigate={() => setSidebarOpen(false)}
            collapsed={subSidebarCollapsed}
            onToggleCollapse={() => setSubSidebarCollapsed((prev) => !prev)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
