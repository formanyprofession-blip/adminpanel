import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Users as UsersIcon, Eye } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [viewUser, setViewUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users", {
        params: { page, limit: 10, search: search || undefined, role, status },
      });
      setUsers(data.data);
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, role, status]);

  const toggleActive = async (u) => {
    // Admin user protection on frontend click
    if (u.role === "admin" || u.email === currentUser?.email) {
      toast.error("Admin accounts cannot be deactivated");
      return;
    }

    setTogglingId(u._id);
    try {
      const { data } = await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      setUsers((prev) => prev.map((usr) => (usr._id === u._id ? data.data : usr)));
      toast.success(`User ${data.data.isActive ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success("User deleted successfully");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const initials = (name) =>
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-auto">
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : error ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--color-accent-danger)" }}>
            {error}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted" style={{ borderColor: "var(--color-surface-border)" }}>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isAdmin = u.role === "admin" || u.email === currentUser?.email;

                    return (
                      <tr key={u._id} className="border-b last:border-0 hover:bg-panel-hover" style={{ borderColor: "var(--color-surface-border)" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: "var(--color-brand-primary)" }}
                            >
                              {u.avatar ? <img src={u.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : initials(u.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-heading">{u.name}</p>
                              <p className="truncate text-xs text-muted">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge status={u.role} /></td>
                        <td className="px-4 py-3">
                          {/* Admin check condition */}
                          {isAdmin ? (
                            <Badge status={u.isActive ? "active" : "inactive"} />
                          ) : (
                            <button
                              onClick={() => toggleActive(u)}
                              disabled={togglingId === u._id}
                              className="focus-ring rounded cursor-pointer"
                            >
                              <Badge status={u.isActive ? "active" : "inactive"} />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewUser(u)} className="rounded-md p-1.5 text-muted hover:bg-panel-hover focus-ring" aria-label="View user">
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              disabled={u._id === currentUser?.id || isAdmin}
                              className="rounded-md p-1.5 hover:bg-panel-hover focus-ring disabled:opacity-30"
                              style={{ color: "var(--color-accent-danger)" }}
                              aria-label="Delete user"
                              title={isAdmin ? "Admin account cannot be deleted" : "Delete user"}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="User Details" maxWidth="max-w-sm">
        {viewUser && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-base font-semibold text-white"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                {viewUser.avatar ? <img src={viewUser.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : initials(viewUser.name)}
              </div>
              <div>
                <p className="font-medium text-heading">{viewUser.name}</p>
                <p className="text-xs text-muted">{viewUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted">Role</p>
                <Badge status={viewUser.role} />
              </div>
              <div>
                <p className="text-xs text-muted">Status</p>
                <Badge status={viewUser.isActive ? "active" : "inactive"} />
              </div>
              <div>
                <p className="text-xs text-muted">Phone</p>
                <p className="text-body">{viewUser.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Joined</p>
                <p className="text-body">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete user"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}