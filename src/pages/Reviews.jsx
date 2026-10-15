import React, { useState, useEffect } from "react";
import { Star, Trash2, Edit3, MessageSquare, X } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function UserReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });

  // Custom Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shop/reviews");
      setReviews(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch store reviews");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setEditForm({ rating: rev.rating, comment: rev.comment });
  };

  // Submit Updated Review
  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      const { productId, _id: reviewId } = editingReview;
      const res = await api.put(`/shop/reviews/${productId}/${reviewId}`, editForm);
      
      toast.success(res.data.message || "Review updated successfully!");
      setEditingReview(null);
      fetchAllReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review");
    }
  };

  // Trigger Delete Confirmation Modal
  const confirmDeleteClick = (productId, reviewId) => {
    setReviewToDelete({ productId, reviewId });
    setDeleteModalOpen(true);
  };

  // Execute Delete
  const handleExecuteDelete = async () => {
    if (!reviewToDelete) return;
    const { productId, reviewId } = reviewToDelete;

    try {
      const res = await api.delete(`/shop/reviews/${productId}/${reviewId}`);
      toast.success(res.data.message || "Review deleted successfully!");
      setReviews(reviews.filter((r) => r._id !== reviewId));
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--color-surface-border)" }}>
          <div className="space-y-2">
            <div className="h-6 sm:h-7 w-40 sm:w-48 bg-surface-card rounded-md"></div>
            <div className="h-3 sm:h-4 w-60 sm:w-72 bg-surface-card rounded-md"></div>
          </div>
          <div className="h-7 w-24 sm:h-8 sm:w-28 bg-surface-card rounded-full self-start sm:self-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-xl border p-4 sm:p-5 space-y-3 bg-surface-card h-40" style={{ borderColor: "var(--color-surface-border)" }}>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-muted/20 rounded"></div>
                <div className="h-4 w-14 bg-muted/20 rounded"></div>
              </div>
              <div className="h-4 w-3/4 bg-muted/20 rounded"></div>
              <div className="h-3 w-full bg-muted/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--color-surface-border)" }}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-heading flex items-center gap-2">
            <MessageSquare className="text-primary shrink-0" size={22} /> User Reviews Management
          </h1>
          <p className="text-xs text-muted mt-1">Manage, moderate, and update customer reviews across all store products.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-card border self-start sm:self-auto" style={{ borderColor: "var(--color-surface-border)" }}>
          Total Reviews: {reviews.length}
        </span>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {reviews.map((rev) => (
            <div 
              key={rev._id} 
              className="rounded-xl border p-4 sm:p-5 space-y-3 bg-surface-card flex flex-col justify-between"
              style={{ borderColor: "var(--color-surface-border)" }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 uppercase truncate">
                    {rev.category || "Product"}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-heading line-clamp-1 break-words">Product: {rev.productName}</p>
                <p className="text-xs text-body italic break-words line-clamp-3">"{rev.comment}"</p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between gap-2 text-xs text-muted" style={{ borderColor: "var(--color-surface-border)" }}>
                <div className="min-w-0">
                  <span className="font-semibold text-heading truncate block">{rev.name || "Customer"}</span>
                  <p className="text-[10px]">{new Date(rev.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(rev)}
                    className="p-1.5 rounded-lg border hover:bg-panel-hover text-heading transition-colors"
                    style={{ borderColor: "var(--color-surface-border)" }}
                    title="Edit Review"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => confirmDeleteClick(rev.productId, rev._id)}
                    className="p-1.5 rounded-lg border hover:bg-red-500/10 text-red-500 border-red-500/20 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border p-8 sm:p-12 text-center bg-surface-card" style={{ borderColor: "var(--color-surface-border)" }}>
          <p className="text-xs sm:text-sm text-muted">No reviews submitted by users yet.</p>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="w-full max-w-md rounded-xl border p-4 sm:p-6 bg-surface-card space-y-4 shadow-xl" style={{ borderColor: "var(--color-surface-border)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-surface-border)" }}>
              <h3 className="text-base sm:text-lg font-semibold text-heading">Edit Review</h3>
              <button onClick={() => setEditingReview(null)} className="text-muted hover:text-heading">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Rating (1 to 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent text-heading focus-ring"
                  style={{ borderColor: "var(--color-surface-border)" }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Comment</label>
                <textarea
                  rows={4}
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent text-heading focus-ring resize-none"
                  style={{ borderColor: "var(--color-surface-border)" }}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border hover:bg-panel-hover"
                  style={{ borderColor: "var(--color-surface-border)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: "var(--color-brand-primary)" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="w-full max-w-sm rounded-xl border p-4 sm:p-6 bg-surface-card space-y-4 shadow-xl text-center" style={{ borderColor: "var(--color-surface-border)" }}>
            <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-heading">Delete Review</h3>
              <p className="text-xs text-muted mt-1">Are you sure you want to remove this review permanently? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border hover:bg-panel-hover"
                style={{ borderColor: "var(--color-surface-border)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}