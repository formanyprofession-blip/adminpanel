import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users as UsersIcon,
  Banknote,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { Link } from "react-router-dom";

// Hardcoded PKR Currency Formatter Function
const currency = (n) => {
  const formattedNumber = Number(n || 0).toLocaleString("en-PK");
  return `Rs. ${formattedNumber}`;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/dashboard/stats");
        setStats(data.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center text-sm" style={{ color: "var(--color-accent-danger)" }}>
        {error}
      </div>
    );
  }

  const statusEntries = Object.entries(stats.statusSummary || {});

  return (
    <div className="space-y-6">
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={currency(stats.totalRevenue)} icon={Banknote} accent="var(--color-accent-success)" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} accent="var(--color-brand-primary)" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} accent="var(--color-accent-info)" />
        <StatCard label="Total Users" value={stats.totalUsers} icon={UsersIcon} accent="var(--color-accent-warning)" />
      </div> */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Link to="/orders" className="block">
    <StatCard label="Total Revenue" value={currency(stats.totalRevenue)} icon={Banknote} accent="var(--color-accent-success)" />
  </Link>
  
  <Link to="/orders" className="block">
    <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} accent="var(--color-brand-primary)" />
  </Link>
  
  <Link to="/products" className="block">
    <StatCard label="Total Products" value={stats.totalProducts} icon={Package} accent="var(--color-accent-info)" />
  </Link>
  
  <Link to="/users" className="block">
    <StatCard label="Total Users" value={stats.totalUsers} icon={UsersIcon} accent="var(--color-accent-warning)" />
  </Link>
</div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-heading">Revenue overview (last 6 months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.revenueOverview}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
              <XAxis dataKey="month" stroke="var(--color-content-sub)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-content-sub)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-surface-border)", borderRadius: 8, fontSize: 13 }}
                formatter={(value) => currency(value)}
              />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-brand-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-heading">Order status summary</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusEntries.map(([status, count]) => ({ status, count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
              <XAxis dataKey="status" stroke="var(--color-content-sub)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-content-sub)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-surface-border)", borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="count" fill="var(--color-brand-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--color-surface-border)" }}>
            <h2 className="text-sm font-semibold text-heading">Recent orders</h2>
          </div>
          {stats.recentOrders?.length ? (
            <div className="divide-y" style={{ borderColor: "var(--color-surface-border)" }}>
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between px-5 py-3.5" style={{ borderColor: "var(--color-surface-border)" }}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-heading">{order.user?.name || "Guest"}</p>
                    <p className="truncate text-xs text-muted">#{order._id.slice(-8)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-heading">{currency(order.total)}</span>
                    <Badge status={order.orderStatus} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} title="No orders yet" description="Orders will show up here as customers check out." />
          )}
        </div>

        <div className="card">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--color-surface-border)" }}>
            <h2 className="text-sm font-semibold text-heading">Top selling products</h2>
          </div>
          {stats.topSellingProducts?.length ? (
            <div className="divide-y" style={{ borderColor: "var(--color-surface-border)" }}>
              {stats.topSellingProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between px-5 py-3.5 border-[var(--color-surface-border)]">
                  <p className="truncate text-sm font-medium text-heading">{p.name}</p>
                  <div className="text-right">
                    <p className="text-sm font-medium text-heading">{currency(p.revenue)}</p>
                    <p className="text-xs text-muted">{p.totalSold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Package} title="No sales yet" description="Best sellers will appear here once orders come in." />
          )}
        </div>
      </div>
    </div>
  );
}