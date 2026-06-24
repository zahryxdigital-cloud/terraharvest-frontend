import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import axios from "axios";
import { products as fallbackProducts } from "../../data/products";

// Using the backend API URL directly for Server Side Rendering SEO metadata
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

async function getProductBySlug(slug: string) {
  try {
    const { data } = await axios.get(`${API_URL}/products/${slug}`);
    return data.data;
  } catch (error) {
    console.warn("Server-side single product fetch failed, using fallback product for slug:", slug);
    const fp = fallbackProducts.find(p => p.slug === slug);
    if (fp) {
      return mapFallbackToProduct(fp);
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const image = product.images?.[0];

  return {
    title: `${product.name} | Terra Harvest`,
    description: product.description,
    keywords: [product.name, product.category, "dehydrated fruit", "organic", "dried fruit"],
    openGraph: {
      title: `${product.name} | Terra Harvest`,
      description: product.description,
      type: "website",
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Terra Harvest`,
      description: product.description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  return <ProductDetailClient slug={slug} initialProduct={product} />;
}
