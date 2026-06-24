import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addToCartBackend, setCartOpen } from "../redux/cartSlice";
import { useRouter } from "next/navigation";
import type { Product } from "../redux/productSlice";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? "text-gold" : "text-sand"
            }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  index?: number;
  animate?: boolean;
}

export default function ProductCard({
  product,
  index = 0,
  animate = true,
}: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!animate);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!animate) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [animate]);

  const hasStock = product.stock > 0;

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col bg-cream rounded-2xl overflow-hidden border border-warm-beige/60 transition-all duration-500 hover:shadow-2xl hover:shadow-muted-brown/15 hover:-translate-y-1.5 grain-overlay ${visible ? "animate-fade-in-up opacity-100" : "opacity-0"
        }`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Out of Stock Overlay */}
      {!hasStock && (
        <div className="absolute inset-0 z-40 bg-cream/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
          <span className="px-5 py-2 bg-dark-brown/90 text-cream rounded-full text-xs font-semibold tracking-widest uppercase">
            Out of Stock
          </span>
        </div>
      )}

      {/* Top badges/labels */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-1.5">
        {product.isFeatured && (
          <span className="inline-block px-3 py-1 bg-burnt-orange text-cream text-[0.62rem] font-bold tracking-widest uppercase rounded-full shadow-sm">
            Top Pick
          </span>
        )}
      </div>

      {/* Category Tag */}
      <div className="absolute top-4 right-4 z-30">
        <span className="inline-block px-2.5 py-1 bg-cream/80 backdrop-blur-sm border border-warm-beige text-[0.6rem] font-medium tracking-widest uppercase text-muted-brown rounded-full">
          {product.category}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
        <Image
          src={product.images[0] || "/images/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* CTA Overlay (Always visible on mobile, hover on desktop) */}
        <div className="absolute inset-0 bg-espresso/10 lg:bg-espresso/0 lg:group-hover:bg-espresso/20 transition-colors duration-500 flex items-end justify-center pb-4 lg:pb-6 pointer-events-none">
          <Link
            href={`/products/${product.slug}`}
            className="pointer-events-auto opacity-100 lg:opacity-0 lg:group-hover:opacity-100 translate-y-0 lg:translate-y-3 lg:group-hover:translate-y-0 transition-all duration-300 px-5 lg:px-6 py-2 lg:py-2.5 bg-cream/95 text-dark-brown rounded-full font-semibold text-xs lg:text-sm hover:bg-white shadow-xl flex items-center gap-1.5"
          >
            View Details
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="relative z-20 p-5 flex flex-col flex-1 space-y-3">
        {/* Name */}
        <div>
          <h3 className="font-serif text-[1.05rem] font-semibold text-dark-brown leading-snug group-hover:text-burnt-orange transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-[0.7rem] text-muted-brown mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Rating Row (Mocked for now as not in model) */}
        <div className="flex items-center gap-2">
          <StarRating rating={5} />
          <span className="text-[0.7rem] text-muted-brown">
            5.0 (Verified)
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-warm-beige to-transparent" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-burnt-orange font-serif">
              ₹{product.price}
            </span>
            <span className="text-[0.65rem] text-muted-brown tracking-wide uppercase">
              {product.type === "dried" ? "Dried Fruit" : "Fruit Powder"}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (!user) {
                return router.push('/signup');
              }
              if (user.role === 'admin') {
                alert("Admins cannot place orders");
                return;
              }
              if (!hasStock) {
                alert("Out of stock");
                return;
              }
              
              dispatch(
                addToCartBackend({
                  id: product._id,
                  productId: product._id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.images[0] || "",
                  type: product.type as any,
                })
              );
              dispatch(setCartOpen(true));
            }}
            disabled={!hasStock}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-dark-brown text-cream rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 hover:bg-espresso hover:shadow-lg hover:shadow-dark-brown/20 group/btn shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:scale-110"
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
    </div>
  );
}

