"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../redux/hooks";
import api from "../../lib/api";
import { setUser, logoutUser } from "../../redux/authSlice";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@terraharvest.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Authenticate with credentials
      await api.post("/auth/login", { email, password });

      // 2. Fetch authenticated profile
      const { data: user } = await api.get("/auth/me");

      // 3. Verify Admin Role
      if (user.role === "admin") {
        dispatch(setUser(user));
        router.push("/admin/products");
      } else {
        await api.post("/auth/logout");
        dispatch(logoutUser());
        setError("Access denied. Admin only.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-6 grain-overlay relative">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-dark-brown/20 m-6 sm:m-12" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-dark-brown/20 m-6 sm:m-12" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-dark-brown/20 m-6 sm:m-12" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-dark-brown/20 m-6 sm:m-12" />

      <div className="w-full max-w-md bg-cream z-10 border border-warm-beige p-8 sm:p-12 shadow-2xl shadow-dark-brown/15 rounded-2xl relative overflow-hidden">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-burnt-orange/80 to-dark-brown" />

        <div className="text-center mb-8 mt-2">
          <span className="inline-block px-3 py-1 bg-dark-brown text-cream text-[0.65rem] font-bold tracking-widest uppercase rounded-full mb-4 shadow-sm">
            Admin Access Only
          </span>
          <h1 className="font-serif text-3xl font-bold text-dark-brown mb-2 tracking-wide">
            Terra Harvest
          </h1>
          <p className="text-muted-brown text-sm font-medium">
            Management Portal
          </p>
          <div className="vintage-divider mx-auto mt-5">
            <span className="vintage-divider-icon text-gold">✦</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/50 border border-red-200/60 text-red-700 text-sm rounded-lg flex items-center gap-3 animate-fade-in-up">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-wider text-dark-brown uppercase">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-warm-beige rounded-xl px-4 py-3.5 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all duration-300 placeholder-muted-brown/50 shadow-inner"
              placeholder="admin@terraharvest.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-wider text-dark-brown uppercase">
              Secure Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-warm-beige rounded-xl px-4 py-3.5 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all duration-300 placeholder-muted-brown/50 shadow-inner"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full bg-dark-brown text-cream py-4 rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-espresso hover:shadow-lg hover:shadow-dark-brown/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-4 overflow-hidden"
          >
            <span className={`relative z-10 flex items-center justify-center gap-2 transition-transform duration-300 ${loading ? 'scale-95' : 'group-hover:scale-105'}`}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Login as Admin"
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-burnt-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-warm-beige/50 text-center">
          <p className="text-xs text-muted-brown flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured via 256-bit AES Server Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
