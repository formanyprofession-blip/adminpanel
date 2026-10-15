import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, User as UserIcon, Lock, Store } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "security", label: "Security", icon: Lock },
  { id: "store", label: "Store", icon: Store },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("profile");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--color-surface-border)" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
            style={
              tab === id
                ? { borderColor: "var(--color-brand-primary)", color: "var(--color-brand-light)" }
                : { borderColor: "transparent", color: "var(--color-content-sub)" }
            }
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab user={user} updateUser={updateUser} />}
      {tab === "security" && <SecurityTab />}
      {tab === "store" && <StoreTab />}
    </div>
  );
}

function ProfileTab({ user, updateUser }) {
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const initials = (name || "A").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", { name, avatar, phone });
      updateUser(data.data);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials}
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-body">Avatar URL</label>
          <input className="input-field" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" disabled={saving} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-body">Name</label>
        <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-body">Email</label>
        <input className="input-field opacity-60" value={user?.email || ""} disabled />
        <p className="mt-1 text-xs text-muted">Email cannot be changed here.</p>
      </div>

      {/* <div>
        <label className="mb-1.5 block text-sm font-medium text-body">Phone</label>
        <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" disabled={saving} />
      </div> */}

      <div className="flex justify-end border-t pt-4" style={{ borderColor: "var(--color-surface-border)" }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!currentPassword) errs.currentPassword = "Current password is required";
    if (!newPassword || newPassword.length < 6) errs.newPassword = "New password must be at least 6 characters";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="text-sm font-semibold text-heading">Change password</h2>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-body">Current password</label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            className="input-field pr-10"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={saving}
          />
          <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-body" tabIndex={-1}>
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.currentPassword && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{errors.currentPassword}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-body">New password</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            className="input-field pr-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={saving}
          />
          <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-body" tabIndex={-1}>
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.newPassword && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{errors.newPassword}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-body">Confirm new password</label>
        <input
          type={showNew ? "text" : "password"}
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={saving}
        />
        {errors.confirmPassword && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{errors.confirmPassword}</p>}
      </div>

      <div className="flex justify-end border-t pt-4" style={{ borderColor: "var(--color-surface-border)" }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}

function StoreTab() {
  const [store, setStore] = useState({
    storeName: "",
    storeEmail: "",
    primaryPhone: "",
    secondaryPhone: "",
    whatsappOne: "",
    whatsappTwo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/store/settings");
        if (data?.data) {
          setStore({
            storeName: data.data.storeName || "",
            storeEmail: data.data.storeEmail || "",
            primaryPhone: data.data.primaryPhone || "",
            secondaryPhone: data.data.secondaryPhone || "",
            whatsappOne: data.data.whatsappOne || "",
            whatsappTwo: data.data.whatsappTwo || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load store settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/store/settings", store);
      toast.success("Store settings updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save store settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-8 text-center text-sm text-[var(--color-content-muted)] animate-pulse">
        Loading settings…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Store Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-content-main)]">
            Store name
          </label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="My Store"
            value={store.storeName}
            onChange={(e) => setStore({ ...store, storeName: e.target.value })}
            disabled={saving}
          />
        </div>

        {/* Store Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-content-main)]">
            Store email
          </label>
          <input
            type="email"
            className="input-field w-full"
            placeholder="support@example.com"
            value={store.storeEmail}
            onChange={(e) => setStore({ ...store, storeEmail: e.target.value })}
            disabled={saving}
          />
        </div>

        {/* Primary Phone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-content-main)]">
            Primary Phone
          </label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="+1 (555) 000-1234"
            value={store.primaryPhone}
            onChange={(e) => setStore({ ...store, primaryPhone: e.target.value })}
            disabled={saving}
          />
        </div>

        {/* Secondary Phone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-content-main)]">
            Secondary Phone
          </label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="+1 (555) 987-6543"
            value={store.secondaryPhone}
            onChange={(e) => setStore({ ...store, secondaryPhone: e.target.value })}
            disabled={saving}
          />
        </div>

        {/* WhatsApp One */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-content-main)]">
            WhatsApp Number 1
          </label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="+1 (555) 111-2222"
            value={store.whatsappOne}
            onChange={(e) => setStore({ ...store, whatsappOne: e.target.value })}
            disabled={saving}
          />
        </div>

        {/* WhatsApp Two */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-content-main)]">
            WhatsApp Number 2
          </label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="+1 (555) 333-4444"
            value={store.whatsappTwo}
            onChange={(e) => setStore({ ...store, whatsappTwo: e.target.value })}
            disabled={saving}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end border-t pt-5 border-[var(--color-surface-border)]">
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}