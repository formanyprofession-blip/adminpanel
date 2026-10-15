import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const TITLES = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/orders": "Orders",
  "/users": "Users",
  "/settings": "Settings",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const path = "/" + location.pathname.split("/")[1];
  const title = TITLES[path] || "Dashboard";

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--color-surface-base)" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
