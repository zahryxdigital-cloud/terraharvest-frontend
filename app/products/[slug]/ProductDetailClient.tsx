"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addToCartBackend, setCartOpen } from "../../redux/cartSlice";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import type { Product } from "../../redux/productSlice";
import { fetchProductBySlug, fetchProducts } from "../../redux/productSlice";
import api from "../../lib/api";
import { ProductDetailSkeleton } from "../../components/ui/Skeleton";


/* ─── Star Rating ────────────────────────────────────────────────────────── */
function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sz} ${star <= Math.round(rating) ? "text-gold" : "text-warm-beige"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Quantity Stepper ───────────────────────────────────────────────────── */
function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center border border-warm-beige rounded-xl overflow-hidden">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-4 py-3 text-dark-brown hover:bg-warm-beige/60 transition-colors text-lg font-light"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-10 text-center font-semibold text-dark-brown text-sm">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="px-4 py-3 text-dark-brown hover:bg-warm-beige/60 transition-colors text-lg font-light"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

/* ─── Main Client Component ──────────────────────────────────────────────── */
export default function ProductDetailClient({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct?: Product | null;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { currentProduct: reduxProduct, items: relatedProducts, loading } = useAppSelector((state) => state.product);

  const product = reduxProduct || initialProduct;
  const showSkeleton = reduxProduct === null && loading && initialProduct === undefined;

  useEffect(() => {
    setMounted(true);
    if (slug) {
      dispatch(fetchProductBySlug(slug)).unwrap().then((fetchedProduct) => {
        // Fetch related products belonging to the same category
        if (fetchedProduct && fetchedProduct.category) {
          dispatch(fetchProducts({ category: fetchedProduct.category, limit: 3 }));
        }
      });
    }
  }, [slug, dispatch]);

  if (showSkeleton && !product) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-screen">
          <section className="pt-36 pb-14 bg-parchment/30">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <ProductDetailSkeleton />
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-parchment/30 text-center">
        <h1 className="text-4xl font-serif text-dark-brown mb-4">Product Not Found</h1>
        <Link href="/products" className="text-burnt-orange underline">Return to Shop</Link>
      </div>
    );
  }

  function handleAddToCart() {
    if (!user) {
      return router.push('/signup');
    }
    if (user.role === 'admin') {
      alert("Admins cannot place orders");
      return;
    }
    if (!product) return;
    
    dispatch(
      addToCartBackend({
        id: product._id,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0] || "",
        type: product.type as any,
        quantity: qty,
      })
    );
    setAdded(true);
    dispatch(setCartOpen(true));
    setTimeout(() => setAdded(false), 2200);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      return router.push('/login');
    }
    setSubmittingReview(true);
    setReviewError(null);
    if (!product) return;
    try {
      await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment("");
      setReviewRating(5);
      // Refetch product to update reviews
      dispatch(fetchProductBySlug(slug));
    } catch (err: any) {
      setReviewError(err.response?.data?.message || err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 min-h-screen">
        {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
        <section className="pt-28 pb-4 bg-parchment/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-brown"
            >
              <Link href="/" className="hover:text-burnt-orange transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <svg className="w-3 h-3 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/products" className="hover:text-burnt-orange transition-colors">
                Shop
              </Link>
              <svg className="w-3 h-3 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-dark-brown font-semibold truncate max-w-[180px]">
                {product.name}
              </span>
            </nav>
          </div>
        </section>

        {/* ── Product Detail Block ──────────────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-parchment/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

              {/* LEFT — Image */}
              <div
                className={`relative transition-all duration-700 ${
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
              >
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream border border-warm-beige/60 shadow-2xl shadow-dark-brown/10 grain-overlay group">
                  <Image
                    src={product.images?.[0] || "/images/placeholder.png"}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  
                  {product.isFeatured && (
                    <div className="absolute top-5 left-5 flex flex-col gap-2 z-20">
                      <span className="inline-block px-3.5 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase rounded-full border shadow-sm backdrop-blur-sm bg-burnt-orange/10 text-burnt-orange border-burnt-orange/30">
                        Top Pick
                      </span>
                    </div>
                  )}

                  {/* Wishlist button */}
                  <button
                    onClick={() => setWishlist(!wishlist)}
                    className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-cream/90 backdrop-blur-sm border border-warm-beige/60 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110"
                    aria-label="Add to wishlist"
                  >
                    <svg
                      className={`w-5 h-5 transition-colors duration-300 ${
                        wishlist ? "text-terracotta fill-terracotta" : "text-muted-brown"
                      }`}
                      fill={wishlist ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Out of Stock */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-cream/50 backdrop-blur-sm flex items-center justify-center z-30">
                      <span className="px-6 py-3 bg-dark-brown text-cream rounded-full font-semibold tracking-widest uppercase text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Vintage ornamental accent below image */}
                <div className="flex items-center justify-center gap-3 mt-6 text-muted-brown/40">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
                  <span className="text-gold/50 text-sm">✦</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
                </div>
              </div>

              {/* RIGHT — Info */}
              <div
                className={`space-y-7 transition-all duration-700 delay-150 ${
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
              >
                {/* Category tag */}
                <span className="inline-block px-4 py-1.5 border border-gold/40 rounded-full text-[0.68rem] tracking-[0.18em] uppercase text-muted-brown font-medium">
                  {product.category === "slices" ? "Dried Fruit · Slices" : "Fruit Powder"}
                </span>

                {/* Name */}
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-brown leading-tight mb-2">
                    {product.name}
                  </h1>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <StarRating rating={product.rating || 0} size="lg" />
                  <span className="text-sm text-muted-brown font-medium">
                    {(product.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-brown/60">
                    ({product.numReviews || 0} Reviews)
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-gold/30 via-warm-beige to-transparent" />

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-4xl font-bold text-burnt-orange">
                    ₹{product.price}
                  </span>
                </div>

                <p className="text-xs text-muted-brown tracking-widest uppercase">
                  Net Weight · 100g
                </p>

                {/* Description */}
                <p className="text-muted-brown leading-relaxed text-[0.95rem]">
                  {product.description}
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-gold/30 via-warm-beige to-transparent" />

                {/* Quantity + Add to Cart */}
                <div className="flex items-center gap-4 flex-wrap">
                  <QuantityStepper value={qty} onChange={setQty} />

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 min-w-[180px] flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg ${
                      added
                        ? "bg-olive text-cream shadow-olive/20"
                        : product.stock > 0
                        ? "bg-dark-brown text-cream hover:bg-espresso hover:shadow-dark-brown/25 hover:-translate-y-0.5"
                        : "bg-warm-beige text-muted-brown cursor-not-allowed"
                    }`}
                  >
                    {added ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: "🌿", label: "100% Natural", sub: "No preservatives" },
                    { icon: "🚚", label: "Free Shipping", sub: "Orders ₹999+" },
                    { icon: "♻️", label: "Eco Packed", sub: "Biodegradable" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center text-center p-3 bg-cream/60 rounded-xl border border-warm-beige/60"
                    >
                      <span className="text-xl mb-1">{item.icon}</span>
                      <span className="text-[0.65rem] font-semibold text-dark-brown uppercase tracking-wide">
                        {item.label}
                      </span>
                      <span className="text-[0.6rem] text-muted-brown">{item.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reviews Section ─────────────────────────────────────────── */}
        <section className="py-16 bg-cream border-y border-warm-beige/40">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl font-bold text-dark-brown">Customer Reviews</h2>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex-1 h-px bg-warm-beige" />
                <span className="text-gold/60 text-sm">✦</span>
                <div className="flex-1 h-px bg-warm-beige" />
              </div>
            </div>

            <div className="space-y-8">
              {product.reviews?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-brown">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {product.reviews?.map((review: any) => (
                    <div key={review._id} className="bg-parchment/50 p-6 rounded-2xl border border-warm-beige/60">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold text-dark-brown text-sm">{review.name}</p>
                          <p className="text-xs text-muted-brown mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-dark-brown text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-12 bg-white p-8 rounded-3xl border border-warm-beige shadow-sm">
                <h3 className="font-serif text-xl font-bold text-dark-brown mb-6">Write a Review</h3>
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    {reviewError && (
                      <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-4 flex items-center gap-2">
                         <span>⚠️</span> {reviewError}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-brown font-semibold mb-2">Rating</label>
                      <select 
                        value={reviewRating} 
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full sm:w-auto px-4 py-2 bg-parchment/50 border border-warm-beige rounded-xl text-dark-brown text-sm outline-none focus:border-burnt-orange"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-brown font-semibold mb-2">Comment</label>
                      <textarea 
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell us what you thought about this product..."
                        className="w-full px-4 py-3 bg-parchment/50 border border-warm-beige rounded-xl text-dark-brown text-sm outline-none focus:border-burnt-orange resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-dark-brown text-cream rounded-full font-semibold text-sm hover:bg-espresso transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 bg-parchment/30 rounded-xl border border-warm-beige/40">
                    <p className="text-muted-brown text-sm mb-4">Please log in to write a review.</p>
                    <Link href="/login" className="inline-block px-6 py-2 border-2 border-dark-brown text-dark-brown rounded-full font-semibold text-xs mb-1 hover:bg-dark-brown hover:text-white transition-colors">
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Related Products ──────────────────────────────────────────────── */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="py-16 sm:py-20 bg-parchment/50">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 border border-gold/40 rounded-full text-[0.7rem] tracking-[0.2em] uppercase text-muted-brown font-medium mb-4">
                  You Might Also Like
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-dark-brown">
                  Related Products
                </h2>
                <div className="flex items-center gap-4 max-w-[200px] mx-auto mt-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/40" />
                  <span className="text-gold/60 text-sm">✦</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/40" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {relatedProducts.filter((p: any) => p._id !== product._id).slice(0, 3).map((p: any, i) => (
                  <ProductCard key={p._id} product={p as any} index={i} animate />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-dark-brown text-dark-brown rounded-full font-semibold text-sm transition-all duration-300 hover:bg-dark-brown hover:text-cream group"
                >
                  Browse All Products
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
