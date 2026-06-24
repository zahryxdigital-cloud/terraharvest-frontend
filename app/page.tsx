import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import Footer from "./components/Footer";
import { products as fallbackProducts } from "./data/products";

// Dynamically import below-the-fold components to reduce initial JS bundle size
const About = dynamic(() => import("./components/About"));
const Benefits = dynamic(() => import("./components/Benefits"));
const Testimonials = dynamic(() => import("./components/Testimonials"));

// Helper function to map static fallback product structure to DB/Redux Product structure
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

// A helper function to fetch featured products on the server side
async function getFeaturedProducts() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products?featured=true&limit=6`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn("Server-side fetch failed, using fallback products.");
    // Map fallback products to the correct structure
    return fallbackProducts
      .filter(p => p.isBestseller)
      .slice(0, 6)
      .map(mapFallbackToProduct);
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeaturedProducts initialProducts={featuredProducts} />
        <About />
        <Benefits />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

