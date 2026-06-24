"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../../../lib/api";
import ProductForm from "../../../../../components/admin/ProductForm";
import Toast from "../../../../../components/admin/Toast";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "error" } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // The backend GET /products returns all — find by _id
        const { data } = await api.get("/products?limit=200");
        const found = data.data.find((p: Record<string, unknown>) => p._id === id);
        if (!found) throw new Error("Product not found");
        setProduct(found);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load product";
        setToast({ message: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-burnt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">🔍</span>
        <p className="text-muted-brown font-medium">Product not found</p>
        <Link href="/admin/products" className="text-sm text-burnt-orange underline mt-2 inline-block">
          Back to Products
        </Link>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Map DB product back to form fields
  const initialData = {
    name: String(product.name ?? ""),
    description: String(product.description ?? ""),
    type: String(product.type ?? "") as "dried" | "powder" | "",
    price: String(product.price ?? ""),
    stock: String(product.stock ?? ""),
    category: String(product.category ?? ""),
    images: Array.isArray(product.images) ? (product.images as string[]).join(", ") : "",
    isFeatured: Boolean(product.isFeatured),
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-muted-brown mb-4">
          <Link href="/admin/products" className="hover:text-burnt-orange transition-colors">Products</Link>
          <span>/</span>
          <span className="text-dark-brown font-semibold">Edit</span>
        </nav>
        <h1 className="font-serif text-3xl font-bold text-dark-brown">Edit Product</h1>
        <p className="text-sm text-muted-brown mt-1">
          Editing:{" "}
          <span className="font-semibold text-dark-brown">{String(product.name)}</span>
        </p>
      </div>

      {/* Card */}
      <div className="bg-cream border border-warm-beige rounded-2xl p-6 sm:p-8 shadow-sm">
        <ProductForm productId={id} initialData={initialData} />
      </div>
    </div>
  );
}
