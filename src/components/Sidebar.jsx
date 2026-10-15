import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Store,
  X,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/users", label: "Users", icon: Users },
  { to: "/userreview", label: "User Reviews", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--color-surface-card)",
          borderColor: "var(--color-surface-border)",
        }}
      >
        <div className="flex items-center border-b-[1px] border-[var(--color-surface-border)] justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--color-brand-soft)" }}
            >
              <Store size={18} style={{ color: "var(--color-brand-light)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-heading">Mughal Store</p>
              <p className="text-xs leading-tight text-muted">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-panel-hover lg:hidden focus-ring"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 pt-6 px-3 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring ${
                  isActive ? "text-white" : "text-muted hover:bg-panel-hover hover:text-heading"
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: "var(--color-brand-primary)" } : undefined
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-3 py-4" style={{ borderColor: "var(--color-surface-border)" }}>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-panel-hover hover:text-heading focus-ring"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
