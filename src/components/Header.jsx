import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.name || "A")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between border-b px-4 py-4.5 sm:px-6"
      style={{ backgroundColor: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted hover:bg-panel-hover lg:hidden focus-ring"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* <button
          className="relative rounded-full p-2 text-muted hover:bg-panel-hover focus-ring"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-accent-danger)" }}
          />
        </button> */}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-panel-hover focus-ring"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-heading sm:block">{user?.name}</span>
            <ChevronDown size={14} className="hidden text-muted sm:block" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg border py-1 shadow-lg"
              style={{ backgroundColor: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
            >
              <div className="border-b px-3 py-2" style={{ borderColor: "var(--color-surface-border)" }}>
                <p className="truncate text-sm font-medium text-heading">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-body hover:bg-panel-hover"
              >
                <UserIcon size={15} /> Profile settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-panel-hover"
                style={{ color: "var(--color-accent-danger)" }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
