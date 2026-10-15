import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: "var(--color-surface-base)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm text-muted">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 px-6 text-center" style={{ backgroundColor: "var(--color-surface-base)" }}>
        <h1 className="text-xl font-semibold text-heading">Access denied</h1>
        <p className="text-sm text-muted">Your account doesn't have permission to view the admin panel.</p>
      </div>
    );
  }

  return children;
}
