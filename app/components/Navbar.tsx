"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { toggleCart, clearLocalCart } from "../redux/cartSlice";
import { logoutUser } from "../redux/authSlice";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const dispatch = useAppDispatch();
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);
  const { user } = useAppSelector((state) => state.auth);

  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Our Story", href: "/#about" },
    { label: "Benefits", href: "/#benefits" },
    { label: "Reviews", href: "/#testimonials" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || !isHomePage
          ? "bg-cream/95 backdrop-blur-md shadow-lg shadow-dark-brown/5 py-3"
          : "bg-transparent py-5"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${scrolled || !isHomePage
                  ? "border-dark-brown bg-dark-brown"
                  : "border-cream bg-cream/20"
                }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-5 h-5 transition-colors duration-300 ${scrolled ? "text-cream" : "text-cream"
                  }`}
                fill="currentColor"
              >
                <path d="M17.8 2.8C16 2.09 13.86 2.12 12 3.03 10.14 2.12 8 2.09 6.2 2.8 3.17 3.95 1.5 7.01 2.15 10.21c.95 4.69 5.47 9.18 9.41 11.6.17.1.36.16.55.16s.38-.05.55-.16c3.94-2.42 8.46-6.91 9.41-11.6.65-3.2-1.02-6.26-4.27-7.41zM12 20.54c-3.6-2.32-7.62-6.35-8.44-10.39C3.05 7.53 4.37 5.06 6.7 4.14 8.11 3.61 9.71 3.66 11 4.28l1 .5 1-.5c1.29-.62 2.89-.67 4.3-.14 2.33.92 3.65 3.39 3.14 5.99-.82 4.06-4.84 8.09-8.44 10.41z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif text-xl font-bold tracking-wide transition-colors duration-300 ${scrolled || !isHomePage ? "text-dark-brown" : "text-cream"
                }`}
            >
              Terra Harvest
            </span>
            <span
              className={`text-[0.6rem] tracking-[0.25em] uppercase font-medium transition-colors duration-300 ${scrolled || !isHomePage ? "text-muted-brown" : "text-cream/70"
                }`}
            >
              Est. 2019
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`relative text-sm font-medium tracking-wide transition-colors duration-300 hover:text-burnt-orange group ${scrolled || !isHomePage ? "text-dark-brown" : "text-cream"
                  }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-burnt-orange transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-48 px-4 py-1.5 rounded-full text-sm outline-none transition-all duration-300 border focus:w-64 ${scrolled || !isHomePage
                  ? "bg-transparent border-warm-beige text-dark-brown focus:border-burnt-orange placeholder-muted-brown"
                  : "bg-white/10 border-white/20 text-cream focus:border-white focus:bg-white/20 placeholder-cream/60"
                }`}
            />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <svg className={`w-4 h-4 ${scrolled || !isHomePage ? "text-muted-brown" : "text-cream/80"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <button
            onClick={() => dispatch(toggleCart())}
            className={`relative p-2 rounded-full transition-all duration-300 ${scrolled || !isHomePage
                ? "text-dark-brown hover:bg-warm-beige"
                : "text-cream hover:bg-cream/10"
              }`}
            aria-label="Shopping cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {mounted && totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-burnt-orange text-white text-[0.6rem] flex items-center justify-center font-bold">
                {totalQuantity}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative group">
              <button
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${scrolled || !isHomePage
                    ? "text-dark-brown hover:text-burnt-orange"
                    : "text-cream hover:text-burnt-orange"
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user.name.split(' ')[0]}
              </button>
              <div className="absolute right-0 mt-4 w-48 bg-cream border border-warm-beige rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                <div className="p-2 space-y-1">
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-dark-brown hover:bg-parchment rounded-lg transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/profile" className="block px-4 py-2 text-sm text-dark-brown hover:bg-parchment rounded-lg transition-colors">
                    My Profile
                  </Link>
                  <Link href="/my-orders" className="block px-4 py-2 text-sm text-dark-brown hover:bg-parchment rounded-lg transition-colors">
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      dispatch(clearLocalCart());
                      dispatch(logoutUser());
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors duration-300 ${scrolled || !isHomePage
                  ? "text-dark-brown hover:text-burnt-orange"
                  : "text-cream hover:text-burnt-orange"
                }`}
            >
              Log in
            </Link>
          )}

          <Link
            href="/products"
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${scrolled || !isHomePage
                ? "bg-dark-brown text-cream hover:bg-espresso"
                : "bg-cream text-dark-brown hover:bg-white"
              }`}
          >
            Shop Now
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Mobile Cart */}
          <button
            onClick={() => dispatch(toggleCart())}
            className={`relative p-2 rounded-full transition-all duration-300 ${scrolled || !isHomePage
                ? "text-dark-brown hover:bg-warm-beige"
                : "text-cream hover:bg-cream/10"
              }`}
            aria-label="Shopping cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {mounted && totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-burnt-orange text-white text-[0.6rem] flex items-center justify-center font-bold">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-lg transition-colors duration-300 ${scrolled || !isHomePage ? "text-dark-brown" : "text-cream"
              }`}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-cream/98 backdrop-blur-xl border-t border-gold/20 px-6 py-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 px-4 text-dark-brown font-medium rounded-xl hover:bg-warm-beige/60 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}

          {!user && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block py-3 px-4 text-dark-brown font-medium rounded-xl hover:bg-warm-beige/60 transition-colors duration-200"
            >
              Log in
            </Link>
          )}

          {user && (
            <>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 text-dark-brown font-medium rounded-xl hover:bg-warm-beige/60 transition-colors duration-200"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-4 text-dark-brown font-medium rounded-xl hover:bg-warm-beige/60 transition-colors duration-200"
              >
                My Profile
              </Link>
              <Link
                href="/my-orders"
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-4 text-dark-brown font-medium rounded-xl hover:bg-warm-beige/60 transition-colors duration-200"
              >
                My Orders
              </Link>
              <button
                onClick={() => {
                  dispatch(clearLocalCart());
                  dispatch(logoutUser());
                  setMobileOpen(false);
                }}
                className="block w-full text-left py-3 px-4 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors duration-200"
              >
                Logout ({user.name.split(' ')[0]})
              </button>
            </>
          )}

          <form onSubmit={handleSearch} className="relative mb-2 mt-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none bg-warm-beige/30 border border-warm-beige/60 text-dark-brown focus:border-burnt-orange"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-muted-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <div className="pt-4 border-t border-gold/20">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center py-3 px-4 bg-dark-brown text-cream rounded-full font-semibold hover:bg-espresso transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
