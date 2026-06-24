"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  setCartOpen,
  updateCartItemQty,
  removeFromCartBackend,
} from "../../redux/cartSlice";

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { cartItems, totalPrice, isCartOpen, loading } = useSelector(
    (state: RootState) => state.cart
  );

  // Close when pressing Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(setCartOpen(false));
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [dispatch]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => dispatch(setCartOpen(false))}
        className={`fixed inset-0 bg-dark-brown/40 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cream shadow-2xl z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Grain Overlay */}
        <div className="absolute inset-0 pointer-events-none grain-overlay opacity-50 z-0" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-warm-beige bg-cream pb-5">
          <h2 className="font-serif text-2xl font-bold text-dark-brown">
            Your Cart
          </h2>
          <button
            onClick={() => dispatch(setCartOpen(false))}
            className="p-2 text-muted-brown hover:text-burnt-orange hover:bg-warm-beige/50 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <span className="text-4xl mb-4">🧺</span>
              <p className="text-muted-brown font-medium">Your cart is empty.</p>
              <p className="text-sm text-sand mt-2 max-w-[200px]">
                Looks like you haven&apos;t added any natural goodness yet.
              </p>
              <button
                onClick={() => dispatch(setCartOpen(false))}
                className="mt-6 px-6 py-2.5 border-2 border-dark-brown text-dark-brown rounded-full text-sm font-semibold hover:bg-dark-brown hover:text-cream transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={item.productId || item.id || index} className="flex gap-4 group">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-parchment shrink-0 border border-warm-beige">
                  <Image
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex flex-col flex-1 py-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => dispatch(setCartOpen(false))}
                        className="font-serif font-semibold text-dark-brown hover:text-burnt-orange transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[0.65rem] text-muted-brown tracking-widest uppercase">
                        {item.type === "dried" ? "Dried Fruit" : "Powder"}
                      </span>
                    </div>
                    <span className="font-serif font-bold text-burnt-orange">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className={`flex items-center border border-warm-beige rounded-xl overflow-hidden h-9 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <button
                        onClick={() => dispatch(updateCartItemQty({ id: item.id || item.productId || "", quantity: item.quantity - 1 }) as any)}
                        className="w-10 h-full flex items-center justify-center text-dark-brown hover:bg-warm-beige/60 transition-colors text-lg"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-dark-brown">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(updateCartItemQty({ id: item.id || item.productId || "", quantity: item.quantity + 1 }) as any)}
                        className="w-10 h-full flex items-center justify-center text-dark-brown hover:bg-warm-beige/60 transition-colors text-lg"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCartBackend(item.id || item.productId || "") as any)}
                      className={`text-xs text-muted-brown underline decoration-warm-beige hover:text-terracotta hover:decoration-terracotta transition-colors ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="relative z-10 p-6 bg-cream border-t border-warm-beige space-y-4 shadow-[0_-10px_20px_rgba(201,169,110,0.05)]">
            <div className="flex justify-between items-end">
              <span className="text-muted-brown font-medium uppercase tracking-widest text-xs">
                Subtotal
              </span>
              <span className="font-serif text-2xl font-bold text-dark-brown">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-[0.7rem] text-muted-brown text-center">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => dispatch(setCartOpen(false))}
              className="w-full py-4 bg-dark-brown text-cream rounded-xl font-semibold tracking-wide transition-all duration-300 hover:bg-espresso hover:shadow-lg hover:shadow-dark-brown/20 focus:scale-[0.98] block text-center"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
