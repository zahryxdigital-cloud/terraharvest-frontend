import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { products as fallbackProducts } from "../data/products";

// Using the backend API URL directly for Server Side Rendering SEO metadata
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const metadata: Metadata = {
  title: "Shop Products | Terra Harvest",
  description: "Browse our premium range of dehydrated fruits and powders, naturally preserved and purely delicious.",
};

const mapFallbackToProduct = (fp: any) => ({
  _id: fp.id.toString(),
  name: fp.name,
  slug: fp.slug,
  description: fp.description,
  type: fp.category === "slices" ? "dried" : "powder",
  price: fp.price,
  images: [fp.image || "/images/placeholder.png"],
  stock: fp.inStock ? 100 : 0,
  category: "all",
  isFeatured: fp.isBestseller || false,
  createdAt: new Date().toISOString(),
  rating: fp.rating,
  numReviews: fp.reviews
});

async function getInitialProducts(keyword?: string) {
  try {
    let url = `${API_URL}/products?limit=8`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return {
      data: data.data || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.warn("Server-side products fetch failed, using fallbacks.");
    let filtered = fallbackProducts.map(mapFallbackToProduct);
    if (keyword) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    }
    return {
      data: filtered.slice(0, 8),
      total: filtered.length,
    };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>;
}) {
  const { keyword } = await searchParams;
  const initialData = await getInitialProducts(keyword);

  return (
    <Suspense fallback={<div className="min-h-screen bg-parchment flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-warm-beige border-t-burnt-orange shadow-sm" /></div>}>
      <ShopClient initialProducts={initialData.data} initialTotal={initialData.total} />
    </Suspense>
  );
}
