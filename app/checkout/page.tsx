"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clearCartBackend } from "../redux/cartSlice";
import { RootState } from "../redux/store";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Script from "next/script";

// Form Validation Helper
function isFormValid(formData: Record<string, string>) {
  const requiredFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of requiredFields) {
    if (!formData[field].trim()) return false;
  }
  // Phone should be mostly numbers (could be more strict)
  if (!/^[\d\+\-\s]+$/.test(formData.phone)) return false;
  // Pincode validation (usually 6 digits in India)
  if (!/^\d{5,6}$/.test(formData.pincode)) return false;

  return true;
}

export default function CheckoutPage() {
  const { cartItems, totalPrice } = useSelector((state: RootState) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod]   = useState<"cod" | "online">("cod");

  // ── Coupon State ──
  const [couponCode,     setCouponCode]     = useState("");
  const [couponApplied,  setCouponApplied]  = useState<{ code: string; discountAmount: number; discountType: string; discountValue: number } | null>(null);
  const [couponLoading,  setCouponLoading]  = useState(false);
  const [couponError,    setCouponError]    = useState<string | null>(null);
  const [couponSuccess,  setCouponSuccess]  = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const deliveryCost  = deliveryMethod === "standard" ? 0 : 99;
  const discount      = couponApplied?.discountAmount ?? 0;
  const finalTotal    = Math.max(0, totalPrice + deliveryCost - discount);
  const formValid     = isFormValid(formData);

  // ── Coupon handler ──
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        orderAmount: totalPrice + deliveryCost,
      });
      setCouponApplied(data.coupon);
      setCouponSuccess(`🎉 "${data.coupon.code}" applied — you save ₹${data.coupon.discountAmount.toFixed(2)}!`);
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code.");
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError(null);
    setCouponSuccess(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || cartItems.length === 0) return;
    
    setErrorMSG(null);
    setLoading(true);

    try {
      // Map format because Backend Order model enforces 24-character ObjectId
      const formattedItems = cartItems.map((item, index) => {
        let rawId = String(item.productId || item.id || index + 1);
        if (rawId === "undefined" || rawId === "null") rawId = String(index + 1);
        
        // Discard any characters that aren't valid hex, to prevent BSONCast errors entirely.
        const safeHexId = rawId.replace(/[^0-9a-fA-F]/g, "") || "1";
        const validMongoId = safeHexId.padStart(24, "0").slice(-24);

        return {
          productId: validMongoId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type === "powders" ? "powder" : item.type,
        };
      });

      if (paymentMethod === "online") {
        // Step 1: Create Razorpay Order
        const rzpResponse = await api.post("/payments/create-order", { amount: finalTotal });
        const { id: order_id, currency, amount } = rzpResponse.data;

        // Step 2: Initialize Razorpay Flow
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_replace_me", // Ensure to set this in frontend .env
          amount: amount,
          currency: currency,
          name: "Terra Harvest",
          description: "Premium Dehydrated Fruits",
          order_id: order_id,
          handler: async function (response: any) {
            try {
              // Step 3: Verify Payment Signature
              const verifyRes = await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                // Step 4: Create DB Order
                const payload = {
                  customerName: formData.fullName,
                  phone: formData.phone,
                  email: formData.email,
                  addressLine1: formData.addressLine1,
                  addressLine2: formData.addressLine2,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  items: formattedItems,
                  totalAmount: finalTotal,
                  deliveryType: deliveryMethod,
                  paymentMethod: "online",
                  paymentStatus: "paid",
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                };
                
                const res = await api.post("/orders", payload);
                if (res.data?.success) {
                  if (couponApplied) await api.post("/coupons/apply", { code: couponApplied.code }).catch(() => {});
                  await dispatch(clearCartBackend()).unwrap();
                  router.push(`/order-success?id=${res.data.data._id}`);
                }
              }
            } catch (err: any) {
              setErrorMSG(err.response?.data?.message || err.message || "Payment verification failed.");
              setLoading(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#4A3219", // espresso brown
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          setErrorMSG(response.error.description || "Payment Failed");
          setLoading(false);
        });
        rzp1.open();
        return; // Stop execution here, wait for Razorpay callbacks
      }

      // -- Normal COD Flow --
      const payload = {
        customerName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        items: formattedItems,
        totalAmount: finalTotal,
        deliveryType: deliveryMethod,
        paymentMethod: paymentMethod,
      };

      const res = await api.post("/orders", payload);

      if (res.data?.success) {
        // Apply coupon usage if one was used
        if (couponApplied) {
          await api.post("/coupons/apply", { code: couponApplied.code }).catch(() => {});
        }
        await dispatch(clearCartBackend()).unwrap();
        router.push(`/order-success?id=${res.data.data._id}`);
      } else {
        throw new Error("Order creation failed unexpectedly");
      }
    } catch (err: any) {
      setErrorMSG(err.response?.data?.message || err.message || "Failed to place order.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className="flex-1 min-h-screen bg-parchment/40">
        {/* ── Page Header ────────────────────────────────────────────────────────── */}
        <section className="pt-32 pb-8 sm:pt-40 sm:pb-12 border-b border-warm-beige">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-brown mb-6 animate-fade-in"
            >
              <Link href="/" className="hover:text-burnt-orange transition-colors">Home</Link>
              <span className="text-sand">/</span>
              <button className="hover:text-burnt-orange transition-colors">Cart</button>
              <span className="text-sand">/</span>
              <span className="text-dark-brown font-semibold">Checkout</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-dark-brown mb-3">
                  Checkout
                </h1>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-px bg-gold/50" />
                  <span className="text-gold/80 text-lg leading-none">✦</span>
                  <div className="w-12 h-px bg-gold/50" />
                </div>
              </div>
              <p className="text-sm text-muted-brown bg-cream px-4 py-2 rounded-full border border-warm-beige shadow-sm">
                Secure 256-bit SSL Encryption
              </p>
            </div>
          </div>
        </section>

        {/* ── Checkout Area ──────────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 bg-cream rounded-3xl border border-warm-beige/60">
                <span className="text-5xl mb-4 block">🛒</span>
                <h2 className="font-serif text-2xl text-dark-brown mb-3">Your cart is empty</h2>
                <p className="text-muted-brown mb-6">Looks like you haven't added anything to your cart yet.</p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-3 bg-dark-brown text-cream rounded-full font-semibold transition-colors hover:bg-espresso"
                >
                  Return to Shop
                </Link>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                
                {/* LEFT COLUMN: FORM */}
                <div className="lg:col-span-7 space-y-10">
                  
                  {errorMSG && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errorMSG}
                    </div>
                  )}

                  {/* Shipping Details */}
                  <div className="bg-cream rounded-3xl p-6 sm:p-8 border border-warm-beige shadow-lg shadow-dark-brown/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-burnt-orange to-gold" />

                    <h2 className="font-serif text-2xl font-semibold text-dark-brown mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-warm-beige text-dark-brown flex items-center justify-center text-xs font-bold">1</span>
                      Shipping Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2 relative">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                          placeholder="Jane Doe"
                          required
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">Email (Optional)</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                          placeholder="jane@example.com"
                        />
                      </div>

                      <div className="sm:col-span-2 relative">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">Address Line 1 *</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleInputChange}
                          className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                          placeholder="Flat, House no., Building, Company"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 relative">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleInputChange}
                          className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                          placeholder="Area, Street, Sector, Village"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                          placeholder="Mumbai"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                            placeholder="Maharashtra"
                            required
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-bold uppercase tracking-widest text-muted-brown mb-1.5">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full bg-parchment/50 border border-warm-beige rounded-xl px-4 py-3 text-dark-brown focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange transition-all"
                            placeholder="400001"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="bg-cream rounded-3xl p-6 sm:p-8 border border-warm-beige shadow-lg shadow-dark-brown/5 relative overflow-hidden">
                    <h2 className="font-serif text-2xl font-semibold text-dark-brown mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-warm-beige text-dark-brown flex items-center justify-center text-xs font-bold">2</span>
                      Delivery Options
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Standard */}
                      <label
                        className={`cursor-pointer p-4 rounded-xl border-2 flex items-start gap-4 transition-all duration-300 ${deliveryMethod === "standard"
                            ? "border-burnt-orange bg-burnt-orange/5"
                            : "border-warm-beige hover:border-gold"
                          }`}
                      >
                        <div className="pt-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryMethod === "standard" ? "border-burnt-orange" : "border-warm-beige"
                            }`}>
                            {deliveryMethod === "standard" && <div className="w-2 h-2 rounded-full bg-burnt-orange" />}
                          </div>
                        </div>
                        <input type="radio" className="hidden" checked={deliveryMethod === "standard"} onChange={() => setDeliveryMethod("standard")} />
                        <div>
                          <p className="font-bold text-dark-brown mb-0.5">Standard Delivery</p>
                          <p className="text-xs text-muted-brown mb-1">Delivered in 4-6 business days</p>
                          <p className="text-sm font-semibold text-burnt-orange">Free</p>
                        </div>
                      </label>

                      {/* Express */}
                      <label
                        className={`cursor-pointer p-4 rounded-xl border-2 flex items-start gap-4 transition-all duration-300 ${deliveryMethod === "express"
                            ? "border-burnt-orange bg-burnt-orange/5"
                            : "border-warm-beige hover:border-gold"
                          }`}
                      >
                        <div className="pt-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryMethod === "express" ? "border-burnt-orange" : "border-warm-beige"
                            }`}>
                            {deliveryMethod === "express" && <div className="w-2 h-2 rounded-full bg-burnt-orange" />}
                          </div>
                        </div>
                        <input type="radio" className="hidden" checked={deliveryMethod === "express"} onChange={() => setDeliveryMethod("express")} />
                        <div>
                          <p className="font-bold text-dark-brown mb-0.5">Express Delivery</p>
                          <p className="text-xs text-muted-brown mb-1">Delivered in 1-2 business days</p>
                          <p className="text-sm font-semibold text-burnt-orange">₹99</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-cream rounded-3xl p-6 sm:p-8 border border-warm-beige shadow-lg shadow-dark-brown/5 relative overflow-hidden">
                    <h2 className="font-serif text-2xl font-semibold text-dark-brown mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-warm-beige text-dark-brown flex items-center justify-center text-xs font-bold">3</span>
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      <label
                        className={`cursor-pointer w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-300 ${paymentMethod === "cod"
                            ? "border-olive bg-olive/5"
                            : "border-warm-beige hover:border-gold"
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-olive" : "border-warm-beige"
                          }`}>
                          {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-olive" />}
                        </div>
                        <input type="radio" className="hidden" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                        <span className="font-bold text-dark-brown">Cash on Delivery (COD)</span>
                      </label>

                      <label
                        className={`cursor-pointer w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-300 ${paymentMethod === "online"
                            ? "border-olive bg-olive/5"
                            : "border-warm-beige hover:border-gold"
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "online" ? "border-olive" : "border-warm-beige"
                          }`}>
                          {paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-olive" />}
                        </div>
                        <input type="radio" className="hidden" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
                        <span className="font-bold text-dark-brown flex-1">UPI / Card / Net Banking</span>
                        <div className="flex gap-1">
                          <span className="px-2 py-0.5 border border-warm-beige rounded bg-cream text-[0.6rem] font-bold text-muted-brown">VISA</span>
                          <span className="px-2 py-0.5 border border-warm-beige rounded bg-cream text-[0.6rem] font-bold text-muted-brown">UPI</span>
                        </div>
                      </label>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: ORDER SUMMARY */}
                <div className="lg:col-span-5 sticky top-28">
                  <div className="bg-cream rounded-3xl border border-warm-beige shadow-xl shadow-dark-brown/5 overflow-hidden grain-overlay relative">
                    <div className="p-6 sm:p-8 bg-cream relative z-10">
                      <h2 className="font-serif text-2xl font-bold text-dark-brown mb-6">Order Summary</h2>

                      {/* Items List */}
                      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-parchment shrink-0 border border-warm-beige">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-dark-brown text-cream text-[0.6rem] rounded-full flex items-center justify-center font-bold shadow">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-dark-brown text-sm line-clamp-1">{item.name}</p>
                              <p className="text-[0.65rem] text-muted-brown uppercase tracking-widest mt-0.5">
                                {item.type === "slices" ? "Dried Fruit" : "Powder"}
                              </p>
                            </div>
                            <div className="font-serif font-bold text-dark-brown">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Coupon */}
                      <div className="mb-6">
                        <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-muted-brown mb-2">
                          Gift Card or Discount Code
                        </label>

                        {couponApplied ? (
                          <div className="flex items-center gap-3 p-3 bg-olive/10 border border-olive/30 rounded-xl">
                            <span className="text-olive-dark text-lg">🎟️</span>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-olive-dark">{couponApplied.code}</p>
                              <p className="text-xs text-muted-brown">-₹{couponApplied.discountAmount.toFixed(2)} discount applied</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-xs text-terracotta font-semibold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                                className="flex-1 bg-parchment/50 border border-warm-beige rounded-xl px-4 py-2.5 text-sm text-dark-brown focus:outline-none focus:border-burnt-orange uppercase tracking-widest"
                                placeholder="TERRA10"
                              />
                              <button
                                type="button"
                                onClick={handleApplyCoupon}
                                disabled={!couponCode.trim() || couponLoading}
                                className="px-5 py-2.5 bg-dark-brown text-cream rounded-xl font-semibold text-sm hover:bg-espresso transition-colors disabled:opacity-50"
                              >
                                {couponLoading ? "…" : "Apply"}
                              </button>
                            </div>
                            {couponError   && <p className="text-xs text-terracotta mt-1.5">{couponError}</p>}
                            {couponSuccess && <p className="text-xs text-olive-dark mt-1.5">{couponSuccess}</p>}
                          </>
                        )}
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-warm-beige to-transparent mb-6" />

                      {/* Cost Breakdown */}
                      <div className="space-y-3 mb-6 text-sm">
                        <div className="flex justify-between text-muted-brown">
                          <span>Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)} items)</span>
                          <span className="font-bold text-dark-brown">₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-brown">
                          <span>Delivery</span>
                          <span className="font-bold text-dark-brown">
                            {deliveryCost === 0 ? "Free" : `₹${deliveryCost.toFixed(2)}`}
                          </span>
                        </div>
                        {couponApplied && (
                          <div className="flex justify-between text-olive-dark">
                            <span className="flex items-center gap-1">🎟️ Coupon ({couponApplied.code})</span>
                            <span className="font-bold">-₹{couponApplied.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-warm-beige mb-6" />

                      {/* Total */}
                      <div className="flex justify-between items-end mb-8">
                        <span className="text-base font-bold text-dark-brown uppercase tracking-wide">Total</span>
                        <div className="text-right">
                          <span className="text-xs text-muted-brown mr-2">INR</span>
                          <span className="font-serif text-3xl font-bold text-burnt-orange">
                            ₹{finalTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={!formValid || loading}
                        className="w-full py-4 bg-dark-brown text-cream rounded-xl font-bold text-lg tracking-wide transition-all duration-300 hover:bg-espresso hover:shadow-xl hover:shadow-dark-brown/20 focus:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing Order...
                            </>
                          ) : (
                            <>
                              Place Order securely
                              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </>
                          )}
                        </span>

                        {/* Hover flare */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] skew-x-[-30deg] transition-all duration-700 ease-in-out group-hover:translate-x-[150%]" />
                      </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="bg-parchment p-6 relative z-10 border-t border-warm-beige">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xl mb-1.5 opacity-80">🌿</span>
                          <span className="text-[0.6rem] font-bold text-dark-brown uppercase tracking-widest leading-tight">100% Natural</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xl mb-1.5 opacity-80">🔒</span>
                          <span className="text-[0.6rem] font-bold text-dark-brown uppercase tracking-widest leading-tight">Secure Payment</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xl mb-1.5 opacity-80">🚫</span>
                          <span className="text-[0.6rem] font-bold text-dark-brown uppercase tracking-widest leading-tight">No Preservatives</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
