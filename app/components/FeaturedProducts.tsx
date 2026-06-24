"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../redux/hooks";
import { addToCartBackend, setCartOpen } from "../redux/cartSlice";
import { RootState } from "../redux/store";
import { useRouter } from "next/navigation";

import { fetchProducts, Product } from "../redux/productSlice";

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-cream rounded-2xl overflow-hidden border border-warm-beige/60 transition-all duration-500 hover:shadow-2xl hover:shadow-muted-brown/10 hover:-translate-y-2 grain-overlay ${
        visible ? "animate-fade-in-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Badge -> Removed fake badging system */}
      {product.stock <= 0 && (
        <div className="absolute top-4 left-4 z-30">
          <span className="inline-block px-3 py-1 bg-red-900/90 text-white text-[0.65rem] font-semibold tracking-widest uppercase rounded-full">
            Out of Stock
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-parchment">
        <Image
          src={product.images?.[0] || "/images/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-dark-brown/0 group-hover:bg-dark-brown/20 transition-colors duration-500 flex items-center justify-center">
          <Link 
            href={`/products/${product.slug}`}
            className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-6 py-3 bg-cream text-dark-brown rounded-full font-semibold text-sm hover:bg-white shadow-xl"
          >
            Quick View
          </Link>
        </div>
      </div>

      <div className="relative z-20 p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-serif text-lg font-semibold text-dark-brown leading-snug hover:text-burnt-orange transition-colors duration-300 cursor-pointer">
                {product.name}
              </h3>
            </Link>
            <span className="text-xs text-muted-brown tracking-wide capitalize">
              {product.category} · {product.type}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-burnt-orange font-serif">
              ₹{product.price}
            </span>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!user) {
              return router.push("/signup");
            }
            if (user.role === "admin") {
              alert("Admins cannot place orders");
              return;
            }
            if (product.stock <= 0) {
              alert("Sorry! This product is currently out of stock.");
              return;
            }
            
            dispatch(
              addToCartBackend({
                id: product._id,
                productId: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.images?.[0] || "",
                type: product.type as any,
              })
            );
            dispatch(setCartOpen(true));
          }}
          className="w-full py-3 px-4 bg-dark-brown text-cream rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-espresso hover:shadow-lg hover:shadow-dark-brown/20 flex items-center justify-center gap-2 group/btn cursor-pointer"
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const dispatch = useAppDispatch();
  const { items: products, loading } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    // Only fetch if not already populated with featured or if we want to ensure freshness
    dispatch(fetchProducts({ featured: true, limit: 6 }));
  }, [dispatch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="products" className="relative py-24 sm:py-32 bg-parchment/50">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-16 ${
            headerVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <span className="inline-block px-4 py-1.5 border border-gold/40 rounded-full text-xs tracking-[0.2em] uppercase text-muted-brown font-medium mb-4">
            Our Collection
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-dark-brown mb-4">
            Handpicked &amp; Handcrafted
          </h2>
          <div className="vintage-divider mx-auto mb-6">
            <span className="vintage-divider-icon">✦</span>
          </div>
          <p className="text-muted-brown text-lg leading-relaxed">
            Each batch is carefully selected from organic farms and slowly
            dehydrated to preserve every ounce of flavor and nutrition.
          </p>
        </div>

        {/* Asymmetrical Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burnt-orange"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* First row: normal cards */}
            {products.slice(0, 2).map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
            {/* Third card spans more height visually via padding */}
            {products[2] && (
              <div className="sm:col-span-2 lg:col-span-1 lg:row-span-1">
                <ProductCard
                  key={products[2]._id}
                  product={products[2]}
                  index={2}
                />
              </div>
            )}
            {/* Second row */}
            {products.slice(3, 6).map((product, i) => (
              <ProductCard key={product._id} product={product} index={i + 3} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-brown">
            No featured products at this time. Check our shop!
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-14">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-dark-brown text-dark-brown rounded-full font-semibold transition-all duration-300 hover:bg-dark-brown hover:text-cream group"
          >
            View All Products
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
