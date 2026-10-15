import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Eye, Trash2, ShoppingCart } from "lucide-react";
import api from "../api/axios";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";

// Currency helper updated to Rs.
const currency = (n) => `Rs. ${(n || 0).toLocaleString("en-PK")}`;

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", {
        params: { page, limit: 10, search: search || undefined, orderStatus, paymentStatus },
      });
      setOrders(data.data);
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, orderStatus, paymentStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [search, orderStatus, paymentStatus]);

  const openDetails = async (order) => {
    try {
      const { data } = await api.get(`/orders/${order._id}`);
      setSelectedOrder(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load order details");
    }
  };

  const handleStatusUpdate = async (field, value) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${selectedOrder._id}/status`, { [field]: value });
      setSelectedOrder({ ...selectedOrder, ...data.data });
      toast.success("Order updated successfully");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/orders/${deleteTarget._id}`);
      toast.success("Order deleted successfully");
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name/email…"
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="input-field w-auto">
            <option value="all">All order statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="input-field w-auto">
            <option value="all">All payment statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : error ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--color-accent-danger)" }}>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted" style={{ borderColor: "var(--color-surface-border)" }}>
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Items</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b last:border-0 hover:bg-panel-hover" style={{ borderColor: "var(--color-surface-border)" }}>
                      <td className="px-4 py-3 font-mono text-xs text-body">#{order._id.slice(-8)}</td>
                      <td className="px-4 py-3">
                        <p className="text-body">{order.user?.name || "Guest"}</p>
                        <p className="text-xs text-muted">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-body">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 font-medium text-heading">{currency(order.total)}</td>
                      <td className="px-4 py-3"><Badge status={order.paymentStatus} /></td>
                      <td className="px-4 py-3"><Badge status={order.orderStatus} /></td>
                      <td className="px-4 py-3 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetails(order)} className="rounded-md p-1.5 text-muted hover:bg-panel-hover focus-ring" aria-label="View order">
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="rounded-md p-1.5 hover:bg-panel-hover focus-ring"
                            style={{ color: "var(--color-accent-danger)" }}
                            aria-label="Delete order"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details" maxWidth="max-w-2xl">
        {selectedOrder && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted">Customer</p>
                <p className="text-body">{selectedOrder.user?.name}</p>
                <p className="text-xs text-muted">{selectedOrder.user?.email}</p>
                {selectedOrder.user?.phone && <p className="text-xs text-muted">{selectedOrder.user.phone}</p>}
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted">Shipping Address</p>
                <p className="text-body">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-xs text-muted">
                  {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}{" "}
                  {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode},{" "}
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted">Ordered Products</p>
              <div className="divide-y rounded-lg border" style={{ borderColor: "var(--color-surface-border)" }}>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5" style={{ borderColor: "var(--color-surface-border)" }}>
                    {console.log(item)
                    }
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md" style={{ backgroundColor: "var(--color-surface-hover)" }}>
                        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <ShoppingCart size={14} className="text-muted" />}
                      </div>
                      <div>
                        <p className="text-body">{item.name}</p>
                        <p className="text-xs text-muted">{currency(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-heading">{currency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-xs" style={{ borderColor: "var(--color-surface-border)" }}>
              <div className="flex justify-between col-span-2"><span className="text-muted">Subtotal</span><span className="text-body">{currency(selectedOrder.subtotal)}</span></div>
              <div className="flex justify-between col-span-2"><span className="text-muted">Discount</span><span className="text-body">-{currency(selectedOrder.discount)}</span></div>
              <div className="flex justify-between col-span-2"><span className="text-muted">Shipping</span><span className="text-body">{currency(selectedOrder.shipping)}</span></div>
              <div className="flex justify-between col-span-2 border-t pt-2 font-semibold" style={{ borderColor: "var(--color-surface-border)" }}><span className="text-heading">Total</span><span className="text-heading">{currency(selectedOrder.total)}</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">Order Status</label>
                <select
                  className="input-field"
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusUpdate("orderStatus", e.target.value)}
                  disabled={updating}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">Payment Status</label>
                <select
                  className="input-field"
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleStatusUpdate("paymentStatus", e.target.value)}
                  disabled={updating}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-muted">
              Order #{selectedOrder._id.slice(-8)} · Placed on {new Date(selectedOrder.createdAt).toLocaleString()} · Payment method: {selectedOrder.paymentMethod}
            </p>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete order"
        message={`Are you sure you want to delete order #${deleteTarget?._id?.slice(-8)}? This action cannot be undone.`}
      />
    </div>
  );
}