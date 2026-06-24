import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import axios from "axios";

// Using the backend API URL directly for Server Side Rendering SEO metadata
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await axios.get(`${API_URL}/products/${slug}`);
    const product = data.data;
    if (!product) return { title: "Product Not Found" };

    const image = product.images?.[0];

    return {
      title: product.name,
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
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Pass the slug to the client component to handle the actual data fetching through Redux
  return <ProductDetailClient slug={slug} />;
}
