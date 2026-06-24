"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { loadUser, setUser } from "../redux/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FIELDS = [
  { name: "name",        label: "Full Name",                 type: "text",  placeholder: "Jane Doe",             required: true },
  { name: "phone",       label: "Phone Number",              type: "tel",   placeholder: "+91 98765 43210",       required: false },
  { name: "addressLine1",label: "Address Line 1",            type: "text",  placeholder: "Flat, House No., Building", required: false },
  { name: "addressLine2",label: "Address Line 2 (Optional)", type: "text",  placeholder: "Area, Street, Sector",  required: false },
  { name: "city",        label: "City",                      type: "text",  placeholder: "Mumbai",                required: false },
  { name: "state",       label: "State",                     type: "text",  placeholder: "Maharashtra",           required: false },
  { name: "pincode",     label: "Pincode",                   type: "text",  placeholder: "400001",                required: false },
] as const;

type FormKey = (typeof FIELDS)[number]["name"];

export default function ProfilePage() {
  const dispatch   = useAppDispatch();
  const router     = useRouter();
  const { user, isInitialized } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState<Record<FormKey, string>>({
    name: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", pincode: "",
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Hydrate form from Redux user state
  useEffect(() => {
    if (isInitialized && !user) router.replace("/login");
    if (user) {
      setForm({
        name:         (user as any).name         || "",
        phone:        (user as any).phone        || "",
        addressLine1: (user as any).addressLine1 || "",
        addressLine2: (user as any).addressLine2 || "",
        city:         (user as any).city         || "",
        state:        (user as any).state        || "",
        pincode:      (user as any).pincode      || "",
      });
    }
  }, [user, isInitialized, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { data } = await api.put("/auth/profile", form);
      dispatch(setUser(data));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burnt-orange" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-parchment/40 pt-36 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          {/* ── Header ── */}
          <div className="text-center mb-12">
            {/* Avatar */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-burnt-orange to-gold flex items-center justify-center text-cream font-serif text-3xl font-bold shadow-lg mb-5">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <h1 className="font-serif text-4xl font-bold text-dark-brown mb-2">My Profile</h1>
            <p className="text-muted-brown text-sm">{user?.email}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="text-gold text-lg">✦</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <Link href="/my-orders"
              className="flex items-center gap-3 bg-cream border border-warm-beige rounded-2xl p-4 hover:border-burnt-orange/40 hover:shadow-md transition-all group">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold text-dark-brown text-sm group-hover:text-burnt-orange transition-colors">Order History</p>
                <p className="text-xs text-muted-brown">View past purchases</p>
              </div>
            </Link>
            <Link href="/products"
              className="flex items-center gap-3 bg-cream border border-warm-beige rounded-2xl p-4 hover:border-burnt-orange/40 hover:shadow-md transition-all group">
              <span className="text-2xl">🛍️</span>
              <div>
                <p className="font-semibold text-dark-brown text-sm group-hover:text-burnt-orange transition-colors">Continue Shopping</p>
                <p className="text-xs text-muted-brown">Browse our catalogue</p>
              </div>
            </Link>
          </div>

          {/* ── Profile Form ── */}
          <form onSubmit={handleSubmit}
            className="bg-cream rounded-3xl border border-warm-beige shadow-xl shadow-dark-brown/5 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-burnt-orange via-gold to-olive" />
            <div className="p-8">
              <h2 className="font-serif text-2xl font-semibold text-dark-brown mb-6">Personal Information</h2>

              {/* Alerts */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-olive/10 border border-olive/30 text-olive-dark text-sm rounded-xl flex items-center gap-2">
                  <span>✅</span> Profile updated successfully!
                </div>
              )}

              {/* Email (read-only) */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">
                  Email Address <span className="text-[0.6rem] font-normal normal-case tracking-normal">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full bg-parchment/30 border border-warm-beige/50 rounded-xl px-4 py-3 text-muted-brown cursor-not-allowed text-sm"
                />
              </div>

              {/* Dynamic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {FIELDS.map((field) => (
                  <div key={field.name} className={field.name === "name" || field.name === "addressLine1" || field.name === "addressLine2" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">
                      {field.label} {field.required && <span className="text-burnt-orange">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown text-sm focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="mt-8 flex items-center justify-between">
                <p className="text-xs text-muted-brown">* Required fields</p>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-dark-brown text-cream rounded-xl font-semibold text-sm hover:bg-espresso transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
