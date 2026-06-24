"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchProducts } from "../redux/productSlice";
import { categories, sortOptions } from "../data/products";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductGridSkeleton } from "../components/ui/Skeleton";

const PRODUCTS_PER_PAGE = 8;

/* ─── Empty State ──────────────────────────────────────────────────────────── */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-28 text-center">
      {/* Vintage ornament */}
      <div className="w-20 h-20 rounded-full border-2 border-gold/40 flex items-center justify-center mb-6 relative">
        <span className="text-3xl">🍋</span>
        <div className="absolute inset-0 rounded-full border border-gold/20 scale-125" />
      </div>
      <h3 className="font-serif text-2xl text-dark-brown mb-2">
        Nothing Found
      </h3>
      <p className="text-muted-brown text-sm max-w-xs leading-relaxed mb-6">
        We couldn&apos;t find any products matching your selection. Try a
        different filter or browse all our products.
      </p>
      <button
        onClick={onReset}
        className="px-6 py-3 border-2 border-dark-brown text-dark-brown rounded-full font-semibold text-sm hover:bg-dark-brown hover:text-cream transition-all duration-300"
      >
        View All Products
      </button>
    </div>
  );
}

/* ─── Section Header ───────────────────────────────────────────────────────── */
function SectionHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`text-center max-w-2xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
    >
      {/* Ornamental label */}
      <span className="inline-block px-4 py-1.5 border border-gold/40 rounded-full text-[0.7rem] tracking-[0.2em] uppercase text-muted-brown font-medium mb-5">
        Terra Harvest Collective
      </span>

      <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-brown mb-4 leading-tight">
        Our Products
      </h1>

      {/* Vintage divider */}
      <div className="flex items-center gap-4 max-w-xs mx-auto mb-5">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/50" />
        <span className="text-gold text-lg">✦</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/50" />
      </div>

      <p className="text-muted-brown text-lg leading-relaxed">
        Naturally preserved fruits in slices and powder form —{" "}
        <em className="font-serif text-dark-brown">handcrafted with care</em>,
        sourced from organic farms.
      </p>
    </div>
  );
}

/* ─── Filter Bar ───────────────────────────────────────────────────────────── */
function FilterBar({
  activeCategory,
  setActiveCategory,
  activeSort,
  setActiveSort,
  priceMax,
  setPriceMax,
  totalCount,
}: {
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  activeSort: string;
  setActiveSort: (s: string) => void;
  priceMax: number;
  setPriceMax: (p: number) => void;
  totalCount: number;
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top row: category tabs + filter toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Tabs (Scrollable on mobile) */}
        <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex items-center gap-2 w-max pr-6 sm:pr-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide border transition-all duration-300 shrink-0 ${activeCategory === cat.id
                    ? "bg-dark-brown text-cream border-dark-brown shadow-md shadow-dark-brown/15"
                    : "bg-cream text-muted-brown border-warm-beige hover:border-muted-brown hover:text-dark-brown"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right side: count + filter button */}
        <div className="flex items-center justify-between w-full sm:w-auto self-end sm:self-auto gap-3">
          <span className="text-xs text-muted-brown tracking-wide">
            {totalCount} product{totalCount !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${showFilters
                ? "bg-warm-beige border-muted-brown text-dark-brown"
                : "bg-cream border-warm-beige text-muted-brown hover:border-muted-brown hover:text-dark-brown"
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Expandable filter panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ${showFilters ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-cream/60 border border-warm-beige/60 rounded-2xl p-5 flex flex-wrap gap-6 items-end">
          {/* Sort */}
          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest text-muted-brown font-semibold mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActiveSort(opt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${activeSort === opt.id
                      ? "bg-burnt-orange text-cream border-burnt-orange"
                      : "bg-cream text-muted-brown border-warm-beige hover:border-burnt-orange/50 hover:text-burnt-orange"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[0.65rem] uppercase tracking-widest text-muted-brown font-semibold mb-2">
              Max Price: <span className="text-burnt-orange font-bold">₹{priceMax}</span>
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-burnt-orange cursor-pointer"
            />
            <div className="flex justify-between text-[0.6rem] text-muted-brown mt-1">
              <span>₹5</span>
              <span>₹100</span>
            </div>
          </div>

          {/* In Stock only toggle */}
          <div className="flex items-center gap-2 pb-1">
            <span className="text-[0.65rem] uppercase tracking-widest text-muted-brown font-semibold">
              In stock only
            </span>
            <span className="inline-block px-2 py-0.5 bg-warm-beige text-muted-brown text-[0.6rem] rounded-full">
              Toggle via grid
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─── Shop Page ────────────────────────────────────────────────────────────── */
function ShopPageContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState("new");
  const [priceMax, setPriceMax] = useState(100);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((state) => state.product);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [activeCategory, activeSort, priceMax, keyword]);

  useEffect(() => {
    const query: any = { limit: visibleCount };

    if (keyword) query.keyword = keyword;

    if (activeCategory === "slices") query.type = "dried";
    if (activeCategory === "powders") query.type = "powder";

    if (activeSort === "price-asc") query.sort = "price_asc";
    if (activeSort === "price-desc") query.sort = "price_desc";
    if (activeSort === "new") query.sort = "newest";
    // "popular" doesn't strictly exist on backend yet, so it falls back to createdAt

    dispatch(fetchProducts(query));
  }, [dispatch, activeCategory, activeSort, visibleCount, keyword]);

  // Client-side filter for price since backend doesn't explicitly accept priceMax range yet
  const visible = items.filter((p) => p.price <= priceMax);
  const hasMore = items.length < total && items.length >= visibleCount;

  function handleLoadMore() {
    setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
  }

  function handleReset() {
    setActiveCategory("all");
    setActiveSort("new");
    setPriceMax(100);
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 min-h-screen">
        {/* ── Hero / Page Title ────────────────────────────────────────────── */}
        <section className="relative pt-36 pb-14 sm:pt-40 sm:pb-20 bg-parchment/60 overflow-hidden">
          {/* Decorative grain top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {/* Background decorative botanical shapes */}
          <div
            aria-hidden
            className="absolute top-8 left-8 w-48 h-48 rounded-full bg-burnt-orange/5 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute bottom-8 right-8 w-64 h-64 rounded-full bg-olive/5 blur-3xl pointer-events-none"
          />

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-brown mb-10 animate-fade-in"
            >
              <Link
                href="/"
                className="hover:text-burnt-orange transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <svg className="w-3 h-3 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-dark-brown font-semibold">Shop</span>
            </nav>

            <SectionHeader />
          </div>
        </section>

        {/* ── Product Grid Section ─────────────────────────────────────────── */}
        <section className="relative py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-10">

            {/* Filter Bar */}
            <FilterBar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeSort={activeSort}
              setActiveSort={setActiveSort}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              totalCount={visible.length}
            />

            {/* Thin ornamental divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

            {/* Product Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7"
              id="product-grid"
            >
              {loading && visible.length === 0 ? (
                <ProductGridSkeleton count={8} />
              ) : visible.length === 0 ? (
                <EmptyState onReset={handleReset} />
              ) : (
                visible.map((product, i) => (
                  <ProductCard key={product._id} product={product as any} index={i} />
                ))
              )}
            </div>

            {/* Load More / Pagination */}
            {visible.length > 0 && (
              <div className="flex flex-col items-center gap-4 pt-6">
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="group inline-flex items-center gap-2 px-10 py-4 border-2 border-dark-brown text-dark-brown rounded-full font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-dark-brown hover:text-cream disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Products
                        <svg
                          className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}

                {/* Progress indicator */}
                <div className="flex flex-col items-center gap-2 text-xs text-muted-brown">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 rounded-full bg-warm-beige overflow-hidden w-32">
                      <div
                        className="h-full bg-burnt-orange rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((visible.length / total) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span>
                      {visible.length} of {total}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Bottom Banner ────────────────────────────────────────────────── */}
        <section className="relative py-20 bg-espresso overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-burnt-orange via-gold to-olive" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 70% 50%, #C9A96E 0%, transparent 60%)",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 border border-gold/30 rounded-full text-[0.7rem] tracking-[0.2em] uppercase text-gold/70 font-medium mb-6">
              Bulk & Wholesale
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-4">
              Ordering in Bulk?
            </h2>
            <p className="text-cream/60 text-base leading-relaxed mb-8 max-w-xl mx-auto">
              We offer special pricing for bulk and wholesale orders. Contact us
              to get a custom quote for your business or gifting needs.
            </p>
            <a
              href="mailto:hello@terraharvest.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-burnt-orange text-cream rounded-full font-semibold transition-all duration-300 hover:bg-burnt-orange-dark hover:shadow-xl hover:shadow-burnt-orange/20 group"
            >
              Get a Quote
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-parchment flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-warm-beige border-t-burnt-orange shadow-sm" /></div>}>
      <ShopPageContent />
    </Suspense>
  );
}
