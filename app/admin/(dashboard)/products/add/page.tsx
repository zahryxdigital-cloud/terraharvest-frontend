"use client";

import Link from "next/link";
import ProductForm from "../../../../components/admin/ProductForm";

export default function AddProductPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-muted-brown mb-4">
          <Link href="/admin/products" className="hover:text-burnt-orange transition-colors">Products</Link>
          <span>/</span>
          <span className="text-dark-brown font-semibold">Add New</span>
        </nav>
        <h1 className="font-serif text-3xl font-bold text-dark-brown">Add New Product</h1>
        <p className="text-sm text-muted-brown mt-1">Fill in the details below to add a new product to your catalogue.</p>
      </div>

      {/* Card */}
      <div className="bg-cream border border-warm-beige rounded-2xl p-6 sm:p-8 shadow-sm">
        <ProductForm />
      </div>
    </div>
  );
}
