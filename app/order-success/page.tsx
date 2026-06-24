"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OrderTracker from "../components/OrderTracker";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        if (data.success) {
          setOrder(data.data);
        } else {
          setError("Failed to verify order details.");
        }
      } catch (err: any) {
        setError(err.message || "Could not fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 min-h-[60vh] flex flex-col justify-center">
      {loading ? (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-warm-beige border-t-burnt-orange shadow-sm" />
          <p className="mt-4 text-muted-brown font-medium">Fetching order details...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-cream border border-warm-beige/60 rounded-3xl">
          <span className="text-5xl mb-4 block">🔍</span>
          <h2 className="font-serif text-2xl text-dark-brown mb-2">Order Not Found</h2>
          <p className="text-muted-brown max-w-md mx-auto mb-6">{error}</p>
          <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 bg-dark-brown text-cream rounded-full font-semibold transition-colors hover:bg-espresso">
            Return to Shop
          </Link>
        </div>
      ) : (
        <div className="bg-cream rounded-3xl border border-warm-beige shadow-xl shadow-dark-brown/5 overflow-hidden grain-overlay relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-olive via-gold to-burnt-orange" />
          
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center border-b border-warm-beige/60 pb-10 mb-10">
              <div className="w-20 h-20 bg-olive/10 text-olive-dark flex items-center justify-center rounded-full mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-serif text-4xl font-bold text-dark-brown mb-3">Order Confirmed!</h1>
              <p className="text-lg text-muted-brown mb-2">
                Thank you for your purchase, <span className="font-semibold text-dark-brown">{order?.customerName}</span>.
              </p>
              <p className="text-sm text-sand tracking-wide">
                Order <span className="font-mono text-dark-brown bg-parchment px-2 py-1 rounded">#{orderId?.slice(-6).toUpperCase()}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Order Summary */}
              <div>
                <h3 className="font-serif text-xl font-bold text-dark-brown mb-5 border-b border-warm-beige/60 pb-2">Order Summary</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {order?.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-dark-brown text-sm line-clamp-1">{item.name}</p>
                        <p className="text-[0.65rem] text-muted-brown uppercase tracking-widest mt-0.5">
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="font-serif font-bold text-dark-brown whitespace-nowrap">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-warm-beige border-dashed space-y-2">
                  <div className="flex justify-between text-sm text-muted-brown">
                    <span>Subtotal</span>
                    <span>₹{order?.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-brown">
                    <span>Delivery ({order?.deliveryType})</span>
                    <span>{order?.deliveryType === "express" ? "₹99" : "Free"}</span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-base font-bold text-dark-brown uppercase tracking-wide">Total</span>
                    <span className="font-serif text-2xl font-bold text-burnt-orange">
                      ₹{order?.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-parchment/60 p-6 rounded-2xl border border-warm-beige">
                <h3 className="font-serif text-xl font-bold text-dark-brown mb-5 border-b border-warm-beige/60 pb-2">Delivery Details</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-[0.65rem] uppercase tracking-widest text-muted-brown font-semibold mb-1">Shipping Address</h4>
                    <p className="text-dark-brown leading-relaxed">
                      {order?.customerName}<br />
                      {order?.addressLine1}<br />
                      {order?.addressLine2 && <>{order.addressLine2}<br /></>}
                      {order?.city}, {order?.state} {order?.pincode}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[0.65rem] uppercase tracking-widest text-muted-brown font-semibold mb-1">Contact</h4>
                    <p className="text-dark-brown">{order?.phone}</p>
                    {order?.email && <p className="text-dark-brown">{order.email}</p>}
                  </div>
                  <div>
                    <h4 className="text-[0.65rem] uppercase tracking-widest text-muted-brown font-semibold mb-1">Status</h4>
                    <span className="inline-block px-3 py-1 bg-olive/10 text-olive-dark text-[0.65rem] font-bold tracking-widest uppercase rounded-full mb-2">
                      {order?.orderStatus}
                    </span>
                    {order && <OrderTracker status={order.orderStatus} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products" className="w-full sm:w-auto px-8 py-3.5 bg-dark-brown text-cream rounded-full font-semibold transition-colors hover:bg-espresso shadow-lg shadow-dark-brown/20 text-sm">
                Continue Shopping
              </Link>
              <button 
                onClick={() => window.print()}
                className="w-full sm:w-auto px-8 py-3.5 border border-warm-beige text-dark-brown rounded-full font-semibold transition-colors hover:border-dark-brown hover:bg-parchment text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-parchment/30">
        <Suspense fallback={
          <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-warm-beige border-t-burnt-orange shadow-sm" />
          </div>
        }>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
