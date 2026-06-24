"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../redux/hooks";
import { loadUser } from "../../redux/authSlice";
import { fetchCart } from "../../redux/cartSlice";
import api from "../../lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/signup", { name, email, password });
      await dispatch(loadUser());
      await dispatch(fetchCart());
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-6 grain-overlay relative">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-gold/40 m-8" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-gold/40 m-8" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-gold/40 m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-gold/40 m-8" />

      <div className="w-full max-w-md bg-cream z-10 border border-warm-beige p-8 sm:p-12 shadow-2xl shadow-dark-brown/10 rounded-xl mt-16 lg:mt-0">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-dark-brown mb-2">
            Create Account
          </h1>
          <p className="text-muted-brown text-sm">
            Join Terra Harvest for premium organic dried fruits.
          </p>
          <div className="vintage-divider mx-auto mt-4">
            <span className="vintage-divider-icon">✦</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-dark-brown uppercase">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-parchment/50 border border-warm-beige rounded-none px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-dark-brown uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-parchment/50 border border-warm-beige rounded-none px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-dark-brown uppercase">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-parchment/50 border border-warm-beige rounded-none px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark-brown text-cream py-4 font-semibold tracking-wider uppercase text-sm hover:bg-espresso transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-brown">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-burnt-orange font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
