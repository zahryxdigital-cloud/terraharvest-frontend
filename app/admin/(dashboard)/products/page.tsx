"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "../../../lib/api";
import Toast from "../../../components/admin/Toast";

interface Product {
  _id: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  stock: number;
  category: string;
  isFeatured: boolean;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products?limit=100");
      setProducts(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setToast({ message: "Product deleted successfully", type: "success" });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      setToast({ message: msg, type: "error" });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-dark-brown">Products</h1>
          <p className="text-sm text-muted-brown mt-1">
            {loading ? "Loading…" : `${products.length} products in catalogue`}
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center gap-2 px-5 py-2.5 bg-dark-brown text-cream rounded-xl font-semibold text-sm hover:bg-espresso transition-colors shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-cream rounded-2xl border border-warm-beige shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-muted-brown">
            <div className="w-8 h-8 border-2 border-burnt-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-muted-brown font-medium mb-1">No products found</p>
            <p className="text-sm text-sand mb-5">Make sure the backend is running and database is seeded.</p>
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-dark-brown text-cream rounded-xl font-semibold text-sm hover:bg-espresso transition-colors"
            >
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-beige bg-parchment/60">
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Product</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Category</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Price</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Stock</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Featured</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-beige/50">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-parchment/30 transition-colors">
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-parchment border border-warm-beige shrink-0 relative">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-lg">🍑</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-brown leading-snug">{product.name}</p>
                          <p className="text-[0.65rem] text-muted-brown font-mono mt-0.5">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest ${
                        product.type === "dried"
                          ? "bg-burnt-orange/10 text-burnt-orange"
                          : "bg-olive/10 text-olive-dark"
                      }`}>
                        {product.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 text-muted-brown capitalize">{product.category}</td>

                    {/* Price */}
                    <td className="px-4 py-3.5 text-right font-serif font-bold text-burnt-orange">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-semibold ${product.stock === 0 ? "text-terracotta" : "text-dark-brown"}`}>
                        {product.stock}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="px-4 py-3.5 text-center">
                      {product.isFeatured ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-olive" title="Featured" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-warm-beige" title="Not featured" />
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="px-3 py-1.5 bg-dark-brown/5 border border-dark-brown/10 text-dark-brown rounded-lg text-xs font-semibold hover:bg-dark-brown hover:text-cream transition-all"
                        >
                          Edit
                        </Link>

                        {confirmId === product._id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(product._id)}
                              disabled={deletingId === product._id}
                              className="px-3 py-1.5 bg-terracotta text-cream rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {deletingId === product._id ? "…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-3 py-1.5 bg-warm-beige text-muted-brown rounded-lg text-xs font-semibold hover:bg-sand transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(product._id)}
                            className="px-3 py-1.5 bg-terracotta/10 border border-terracotta/20 text-terracotta rounded-lg text-xs font-semibold hover:bg-terracotta hover:text-cream transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
