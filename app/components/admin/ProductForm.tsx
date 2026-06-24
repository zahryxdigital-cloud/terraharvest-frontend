"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "../../lib/api";
import Toast from "./Toast";

interface ProductFormData {
  name: string;
  description: string;
  type: "dried" | "powder" | "";
  price: string;
  stock: string;
  category: string;
  imageUrls: string; // fallback: comma-separated URL strings
  isFeatured: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  productId?: string;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  type: "",
  price: "",
  stock: "",
  category: "",
  imageUrls: "",
  isFeatured: false,
};

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(productId);

  const [form, setForm] = useState<ProductFormData>({ ...emptyForm, ...initialData });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Image file state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.imageUrls?.split(",")[0]?.trim() || ""
  );
  const [uploadMode, setUploadMode] = useState<"file" | "url">(
    initialData?.imageUrls ? "url" : "file"
  );

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.type) errs.type = "Type is required";
    if (!form.category.trim()) errs.category = "Category is required";
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) errs.price = "Price must be greater than 0";
    const stock = parseInt(form.stock);
    if (isNaN(stock) || stock < 0) errs.stock = "Stock must be 0 or more";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Input change ──────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── File select & preview ─────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size client-side (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "Image must be under 5 MB", type: "error" });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Always use FormData so files can be attached
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("type", form.type);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category.trim().toLowerCase());
      formData.append("isFeatured", String(form.isFeatured));

      if (uploadMode === "file" && imageFile) {
        // Attach the actual file under the field name "image"
        formData.append("image", imageFile);
      } else if (uploadMode === "url" && form.imageUrls.trim()) {
        // Send as text field — backend will parse comma-separated URLs
        formData.append("imageUrls", form.imageUrls.trim());
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEditing) {
        await api.put(`/products/${productId}`, formData, config);
        setToast({ message: "Product updated successfully!", type: "success" });
      } else {
        await api.post("/products", formData, config);
        setToast({ message: "Product created successfully!", type: "success" });
      }

      router.refresh();
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      setToast({ message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const fieldClass = (field: keyof ProductFormData) =>
    `w-full bg-parchment/50 border rounded-xl px-4 py-3 text-sm text-dark-brown focus:outline-none focus:ring-1 transition-all ${
      errors[field]
        ? "border-terracotta focus:border-terracotta focus:ring-terracotta"
        : "border-warm-beige focus:border-burnt-orange focus:ring-burnt-orange"
    }`;

  const labelClass = "block text-[0.68rem] font-bold uppercase tracking-widest text-muted-brown mb-1.5";

  return (
    <>
      <form onSubmit={handleSubmit} noValidate encType="multipart/form-data" className="space-y-6">
        {/* Name */}
        <div>
          <label className={labelClass}>Product Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={fieldClass("name")}
            placeholder="e.g. Dried Mango Slices"
          />
          {errors.name && <p className="text-xs text-terracotta mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={`${fieldClass("description")} resize-none`}
            placeholder="Describe the product…"
          />
          {errors.description && <p className="text-xs text-terracotta mt-1">{errors.description}</p>}
        </div>

        {/* Type + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className={fieldClass("type")}>
              <option value="">Select type…</option>
              <option value="dried">Dried Fruit</option>
              <option value="powder">Fruit Powder</option>
            </select>
            {errors.type && <p className="text-xs text-terracotta mt-1">{errors.type}</p>}
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className={fieldClass("category")}
              placeholder="e.g. tropical, berries, citrus"
            />
            {errors.category && <p className="text-xs text-terracotta mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Price (USD) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-brown text-sm font-semibold">$</span>
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className={`${fieldClass("price")} pl-8`}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="text-xs text-terracotta mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className={labelClass}>Stock Quantity *</label>
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              className={fieldClass("stock")}
              placeholder="0"
            />
            {errors.stock && <p className="text-xs text-terracotta mt-1">{errors.stock}</p>}
          </div>
        </div>

        {/* ── Image Upload Section ── */}
        <div className="space-y-3">
          <label className={labelClass}>Product Image</label>

          {/* Toggle tabs */}
          <div className="flex gap-1 p-1 bg-parchment/50 border border-warm-beige rounded-xl w-fit">
            {(["file", "url"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setUploadMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  uploadMode === mode
                    ? "bg-dark-brown text-cream shadow"
                    : "text-muted-brown hover:text-dark-brown"
                }`}
              >
                {mode === "file" ? "📁 Upload File" : "🔗 Image URL"}
              </button>
            ))}
          </div>

          {uploadMode === "file" ? (
            <div className="space-y-3">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-warm-beige rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-burnt-orange/50 hover:bg-burnt-orange/5 transition-all text-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-3xl">🖼️</span>
                <p className="text-sm font-medium text-dark-brown">
                  Click to choose an image
                </p>
                <p className="text-xs text-muted-brown">
                  JPG, PNG, WebP, AVIF — max 5 MB
                </p>
              </div>

              {/* Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-warm-beige shadow-sm">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized={imagePreview.startsWith("blob:")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-terracotta text-cream text-xs flex items-center justify-center shadow hover:opacity-80 transition-opacity"
                    title="Remove image"
                  >
                    ✕
                  </button>
                  {imageFile && (
                    <p className="text-xs text-muted-brown mt-1 max-w-[160px] truncate">
                      {imageFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                name="imageUrls"
                value={form.imageUrls}
                onChange={handleChange}
                className={fieldClass("imageUrls")}
                placeholder="/images/product-mangoes.png  or  https://…"
              />
              <p className="text-[0.65rem] text-muted-brown mt-1">
                Separate multiple URLs with commas.
              </p>
              {form.imageUrls && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-warm-beige mt-3 shadow-sm">
                  <Image
                    src={form.imageUrls.split(",")[0].trim()}
                    alt="URL preview"
                    fill
                    className="object-cover"
                    sizes="128px"
                    onError={() => {}}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3 p-4 bg-parchment/50 border border-warm-beige rounded-xl">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            className="w-4 h-4 accent-burnt-orange rounded cursor-pointer"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-dark-brown cursor-pointer">
            Mark as Featured Product
            <span className="text-muted-brown font-normal ml-1">(appears on homepage)</span>
          </label>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-warm-beige to-transparent" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-3 bg-dark-brown text-cream rounded-xl font-semibold text-sm hover:bg-espresso transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {imageFile ? "Uploading to Cloudinary…" : "Saving…"}
              </>
            ) : (
              isEditing ? "Update Product" : "Create Product"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-5 py-3 border border-warm-beige text-muted-brown rounded-xl font-semibold text-sm hover:border-dark-brown/30 hover:text-dark-brown transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
