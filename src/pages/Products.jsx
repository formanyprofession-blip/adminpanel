import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, Eye, Package, Upload, X, MinusCircle, PlusCircle, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import axios from "axios";
import api from "../api/axios";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";

const formatCurrency = (amount) => {
  const formattedNumber = Number(amount || 0).toLocaleString("en-PK");
  return `Rs. ${formattedNumber}`;
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  brand: "",
  sku: "",
  stock: "",
  isActive: true,
};

const CLOUD_NAME = "dl4g6bgml";
const UPLOAD_PRESET = "1stclienteccom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [urlInputs, setUrlInputs] = useState([""]);
  const [fileInputs, setFileInputs] = useState([null]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Preview Modal States
  const [viewProduct, setViewProduct] = useState(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: { page, limit: 10, search: search || undefined, category, stock: stockFilter },
      });
      setProducts(data.data);
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refreshCategories = useCallback(() => {
    api
      .get("/products/categories/list")
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    setPage(1);
  }, [search, category, stockFilter]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setUrlInputs([""]);
    setFileInputs([null]);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      category: product.category,
      brand: product.brand || "",
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
    });

    const existingImages = product.images || [];
    setUrlInputs(existingImages.length > 0 ? existingImages : [""]);
    setFileInputs([null]);
    setFormErrors({});
    setFormOpen(true);
  };

  const openViewModal = (product) => {
    setViewProduct(product);
    setActivePreviewIndex(0);
  };

  // URL Input Handlers
  const handleUrlChange = (index, value) => {
    const updated = [...urlInputs];
    updated[index] = value;
    setUrlInputs(updated);
  };

  const addUrlInput = () => {
    if (urlInputs.length + fileInputs.length >= 50) {
      toast.error("Maximum 50 total image slots allowed!");
      return;
    }
    setUrlInputs([...urlInputs, ""]);
  };

  const removeUrlInput = (index) => {
    if (urlInputs.length <= 1) {
      toast.error("Minimum 1 URL field required!");
      return;
    }
    setUrlInputs(urlInputs.filter((_, i) => i !== index));
  };

  // File Upload Handlers
  const handleFileChange = (index, file) => {
    const updated = [...fileInputs];
    updated[index] = file;
    setFileInputs(updated);
  };

  const addFileInput = () => {
    if (urlInputs.length + fileInputs.length >= 50) {
      toast.error("Maximum 50 total image slots allowed!");
      return;
    }
    setFileInputs([...fileInputs, null]);
  };

  const removeFileInput = (index) => {
    if (fileInputs.length <= 1) {
      toast.error("Minimum 1 Upload field required!");
      return;
    }
    setFileInputs(fileInputs.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Enter a valid price";
    if (form.discountPrice && Number(form.discountPrice) > Number(form.price)) {
      errs.discountPrice = "Discount price cannot exceed price";
    }
    if (!form.category.trim()) errs.category = "Category is required";
    if (!form.sku.trim()) errs.sku = "SKU is required";
    if (form.stock === "" || Number(form.stock) < 0) errs.stock = "Enter a valid stock quantity";

    const filledUrls = urlInputs.map((u) => u.trim()).filter(Boolean);
    const selectedFiles = fileInputs.filter(Boolean);
    const totalCount = filledUrls.length + selectedFiles.length;

    if (totalCount === 0) {
      errs.images = "At least 1 Image URL or Upload file is required!";
    } else if (totalCount > 50) {
      errs.images = "Maximum 50 images allowed in total!";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const uploadFilesToCloudinary = async (files) => {
    const promises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      return res.data.secure_url;
    });

    return await Promise.all(promises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const filledUrls = urlInputs.map((u) => u.trim()).filter(Boolean);
      const validFiles = fileInputs.filter(Boolean);

      let uploadedUrls = [];
      if (validFiles.length > 0) {
        setUploadingImage(true);
        uploadedUrls = await uploadFilesToCloudinary(validFiles);
        setUploadingImage(false);
      }

      const finalImages = [...filledUrls, ...uploadedUrls].slice(0, 50);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
        category: form.category.trim(),
        brand: form.brand.trim(),
        sku: form.sku.trim(),
        stock: Number(form.stock),
        images: finalImages,
        isActive: form.isActive,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully");
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save product");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success("Product deleted successfully");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handlePrevImg = () => {
    if (!viewProduct?.images?.length) return;
    setActivePreviewIndex((prev) => (prev === 0 ? viewProduct.images.length - 1 : prev - 1));
  };

  const handleNextImg = () => {
    if (!viewProduct?.images?.length) return;
    setActivePreviewIndex((prev) => (prev === viewProduct.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, SKU, brand…"
            className="input-field pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-auto">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="input-field w-auto">
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock (≤10)</option>
            <option value="out">Out of stock</option>
          </select>
          <button onClick={openCreateForm} className="btn-primary shrink-0">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : error ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--color-accent-danger)" }}>
            {error}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or filters, or add a new product."
            action={
              <button onClick={openCreateForm} className="btn-primary">
                <Plus size={16} /> Add Product
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted" style={{ borderColor: "var(--color-surface-border)" }}>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b last:border-0 hover:bg-panel-hover" style={{ borderColor: "var(--color-surface-border)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                            style={{ backgroundColor: "var(--color-surface-hover)" }}
                          >
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={16} className="text-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-heading">{product.name}</p>
                            <p className="truncate text-xs text-muted">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body">{product.category}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-heading">
                          {formatCurrency(product.discountPrice || product.price)}
                        </span>
                        {!!product.discountPrice && (
                          <span className="ml-1.5 text-xs text-muted line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-body">
                        {product.stock === 0 ? (
                          <span style={{ color: "var(--color-accent-danger)" }}>Out of stock</span>
                        ) : product.stock <= 10 ? (
                          <span style={{ color: "var(--color-accent-warning)" }}>{product.stock} left</span>
                        ) : (
                          product.stock
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={product.isActive ? "active" : "inactive"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openViewModal(product)} className="rounded-md p-1.5 text-muted hover:bg-panel-hover focus-ring" title="View Preview">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => openEditForm(product)} className="rounded-md p-1.5 text-muted hover:bg-panel-hover focus-ring">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(product)} className="rounded-md p-1.5 hover:bg-panel-hover focus-ring" style={{ color: "var(--color-accent-danger)" }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingProduct ? "Edit Product" : "Add Product"} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-body">Product Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={saving} />
              {formErrors.name && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.name}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-body">Description</label>
              <textarea rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={saving} />
              {formErrors.description && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.description}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">Price</label>
              <input type="number" step="0.01" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} disabled={saving} />
              {formErrors.price && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.price}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">Discount Price</label>
              <input type="number" step="0.01" className="input-field" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} disabled={saving} />
              {formErrors.discountPrice && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.discountPrice}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">Category</label>
              <input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={saving} />
              {formErrors.category && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.category}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">Brand</label>
              <input className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} disabled={saving} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">SKU</label>
              <input className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} disabled={saving} />
              {formErrors.sku && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.sku}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">Stock</label>
              <input type="number" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} disabled={saving} />
              {formErrors.stock && <p className="mt-1 text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.stock}</p>}
            </div>

            {/* Dynamic Image Inputs Section */}
            <div className="sm:col-span-2 border-t pt-4 space-y-4" style={{ borderColor: "var(--color-surface-border)" }}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-heading">Product Images (Up to 50 Total)</h4>
                {formErrors.images && <p className="text-xs" style={{ color: "var(--color-accent-danger)" }}>{formErrors.images}</p>}
              </div>

              {/* Option 1: Image URLs */}
              <div className="space-y-3">
                <label className="mb-1 block text-sm font-medium text-body">
                  Option 1: Image URLs
                </label>
                <div className="space-y-2">
                  {urlInputs.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder={`Image URL #${idx + 1}`}
                        className="input-field"
                        value={url}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        disabled={saving}
                      />
                      {urlInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrlInput(idx)}
                          className="text-red-400 hover:text-red-500 p-1.5 shrink-0"
                          title="Remove URL field"
                        >
                          <MinusCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addUrlInput}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 pt-1"
                >
                  <PlusCircle size={15} /> Add More URL Field
                </button>
              </div>

              {/* Option 2: Direct File Upload */}
              <div className="space-y-3 border-t pt-3" style={{ borderColor: "var(--color-surface-border)" }}>
                <label className="mb-1 block text-sm font-medium text-body">
                  Option 2: Direct File Upload
                </label>
                <div className="space-y-2">
                  {fileInputs.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <label className="input-field flex flex-1 cursor-pointer items-center justify-between">
                        <span className="truncate text-body">
                          {file ? file.name : `Select Image File #${idx + 1}`}
                        </span>
                        <Upload size={16} className="text-muted shrink-0 ml-2" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={saving}
                          onChange={(e) => handleFileChange(idx, e.target.files[0] || null)}
                        />
                      </label>
                      {fileInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFileInput(idx)}
                          className="text-red-400 hover:text-red-500 p-1.5 shrink-0"
                          title="Remove Upload field"
                        >
                          <MinusCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFileInput}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 pt-1"
                >
                  <PlusCircle size={15} /> Add More Upload Field
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 pt-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                disabled={saving}
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm text-body">
                Product is active and visible in store
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--color-surface-border)" }}>
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (uploadingImage ? "Uploading Images…" : "Saving…") : editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- PREVIEW MODAL WITH FULL DETAILS AND GALLERY SWITCH --- */}
      <Modal open={!!viewProduct} onClose={() => setViewProduct(null)} title="Product Details" maxWidth="max-w-2xl">
        {viewProduct && (
          <div className="space-y-4 text-sm">
            {/* Header / Main Image Preview Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative group flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-surface-border)", backgroundColor: "var(--color-surface-hover)" }}>
                {viewProduct.images && viewProduct.images.length > 0 ? (
                  <>
                    <img
                      src={viewProduct.images[activePreviewIndex]}
                      alt={viewProduct.name}
                      className="h-full w-full object-cover cursor-zoom-in"
                      onClick={() => setIsZoomOpen(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setIsZoomOpen(true)}
                      className="absolute top-1 right-1 rounded-md bg-slate-900/80 p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      title="Fullscreen Zoom"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </>
                ) : (
                  <Package size={36} className="text-muted" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-lg font-bold text-heading truncate">{viewProduct.name}</h3>
                <p className="text-xs text-muted font-mono">{viewProduct.sku}</p>
              </div>
            </div>

            {/* Gallery Image Selector */}
            {viewProduct.images && viewProduct.images.length > 1 && (
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: "var(--color-surface-border)" }}>
                <p className="text-xs text-muted font-medium">All Gallery Images ({viewProduct.images.length})</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {viewProduct.images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActivePreviewIndex(index)}
                      className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        activePreviewIndex === index
                          ? "border-indigo-500 scale-105 opacity-100"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Description */}
            <div className="pt-2 border-t" style={{ borderColor: "var(--color-surface-border)" }}>
              <p className="text-xs text-muted font-medium mb-1">Description</p>
              <p className="text-body text-xs leading-relaxed whitespace-pre-line">{viewProduct.description || "N/A"}</p>
            </div>

            {/* Full Product Specifications Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs" style={{ borderColor: "var(--color-surface-border)" }}>
              <div>
                <span className="text-muted block mb-0.5">Price</span>
                <span className="font-semibold text-heading text-sm">{formatCurrency(viewProduct.price)}</span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">Discount Price</span>
                <span className="font-semibold text-heading text-sm">
                  {viewProduct.discountPrice ? formatCurrency(viewProduct.discountPrice) : "N/A"}
                </span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">Category</span>
                <span className="font-medium text-body">{viewProduct.category || "N/A"}</span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">Brand</span>
                <span className="font-medium text-body">{viewProduct.brand || "N/A"}</span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">Stock</span>
                <span className="font-medium text-body">{viewProduct.stock}</span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">Status</span>
                <Badge status={viewProduct.isActive ? "active" : "inactive"} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Full Screen Zoom Lightbox */}
      {isZoomOpen && viewProduct?.images?.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-slate-800/80 p-2.5 text-slate-300 hover:bg-red-600 hover:text-white transition"
          >
            <X size={20} />
          </button>

          <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
            <img
              src={viewProduct.images[activePreviewIndex]}
              alt="Full view"
              className="max-h-[85vh] max-w-full object-contain"
            />

            {viewProduct.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImg}
                  className="absolute left-2 rounded-full bg-slate-800/80 p-3 text-white hover:bg-indigo-600 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImg}
                  className="absolute right-2 rounded-full bg-slate-800/80 p-3 text-white hover:bg-indigo-600 transition"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}