import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./admin/layout/AdminLayout";
import Login from "./admin/auth/Login";
import Register from "./admin/auth/Register";
import SiteSettings from "./admin/pages/SiteSettings";
import CmsSettings from "./admin/pages/CmsSettings";
import HomeClients from "./admin/pages/home/HomeClients";
import HomeServices from "./admin/pages/home/HomeServices";
import HomeProject from "./admin/pages/home/HomeProject";
import HomeSolutions from "./admin/pages/home/HomeSolutions";
import HomeTechstack from "./admin/pages/home/HomeTechstack";
import HomeIndustries from "./admin/pages/home/HomeIndustries";
import HomeTestimonials from "./admin/pages/home/HomeTestimonials";
import HomeSubPage from "./admin/pages/HomeSubPage";
import HeaderManagement from "./admin/pages/menu-settings/HeaderManagement";
import FooterManagement from "./admin/pages/menu-settings/FooterManagement";
import ChangePassword from "./admin/pages/ChangePassword";
import { DEFAULT_MENU, DEFAULT_COMPANY, DEFAULT_SECTIONS } from "./data/defaultData";

const STORAGE_KEY = "acuity_site_config";
const ADMIN_TOKEN_KEY = "admin_token";

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!localStorage.getItem(ADMIN_TOKEN_KEY)) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return { menu: DEFAULT_MENU, company: DEFAULT_COMPANY, sections: DEFAULT_SECTIONS };
}

export default function App() {
  const [config, setConfig] = useState(loadConfig);
  const { menu, company, sections } = config;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const save = useCallback((next) => {
    setConfig((prev) => ({ ...prev, ...next }));
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        {/* Auth pages — standalone, no sidebar/header */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />

        {/* Admin panel routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout company={company} />
            </ProtectedRoute>
          }
        >
          <Route index element={<SiteSettings />} />
          <Route path="site-settings" element={<SiteSettings company={company} save={save} />} />
          <Route path="cms-settings" element={<CmsSettings sections={sections} save={save} />} />
          
          {/* Home Settings Sub-sidebar routes */}
          <Route path="home-settings" element={<Navigate to="/admin/home-settings/clients" replace />} />
          <Route path="home-settings/clients" element={<HomeClients />} />
          <Route path="home-settings/services" element={<HomeServices />} />
          <Route path="home-settings/projects" element={<HomeProject />} />
          <Route path="home-settings/solutions" element={<HomeSolutions />} />
          <Route path="home-settings/techstack" element={<HomeTechstack />} />
          <Route path="home-settings/industries" element={<HomeIndustries />} />
          <Route path="home-settings/testimonials" element={<HomeTestimonials />} />
          <Route path="home-settings/:subId" element={<HomeSubPage />} />

          {/* Menu Settings */}
          <Route path="menu-settings" element={<Navigate to="/admin/menu-settings/header" replace />} />
          <Route path="menu-settings/header" element={<HeaderManagement menu={menu} save={save} />} />
          <Route path="menu-settings/footer" element={<FooterManagement company={company} save={save} />} />
          
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
