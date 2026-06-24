"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OrderTracker from "../components/OrderTracker";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/myorders");
        setOrders(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gold/20 text-gold";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-burnt-orange/20 text-burnt-orange";
      case "delivered":
        return "bg-olive/20 text-olive-dark";
      case "cancelled":
        return "bg-terracotta/20 text-terracotta";
      default:
        return "bg-warm-beige text-muted-brown";
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-parchment pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl font-bold text-dark-brown mb-3">Order History</h1>
            <p className="text-muted-brown">Track your purchases and view past orders.</p>
            <div className="vintage-divider mx-auto mt-6">
              <span className="vintage-divider-icon">✦</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-warm-beige border-t-burnt-orange" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-cream rounded-2xl border border-warm-beige">
              <span className="text-4xl mb-4 block">⚠️</span>
              <p className="text-muted-brown">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-cream rounded-2xl border border-warm-beige shadow-sm">
              <span className="text-5xl block mb-4">🛒</span>
              <h2 className="font-serif text-2xl font-bold text-dark-brown mb-2">No Orders Yet</h2>
              <p className="text-muted-brown mb-6">Looks like you haven't made any purchases with us.</p>
              <Link
                href="/products"
                className="inline-flex px-8 py-3 bg-dark-brown text-cream rounded-full font-semibold hover:bg-espresso transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-cream rounded-2xl border border-warm-beige shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-md"
                >
                  {/* Order Meta */}
                  <div className="bg-parchment/60 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-warm-beige flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-brown">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-sm text-dark-brown mb-1">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-warm-beige/60">
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-brown mb-1">
                        Total Amount
                      </p>
                      <p className="font-serif text-2xl font-bold text-burnt-orange">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items + Tracker */}
                  <div className="p-6 md:w-2/3 flex flex-col justify-between">
                    <h4 className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-brown mb-4">
                      Items in this Order ({order.items.reduce((acc, item) => acc + item.quantity, 0)})
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-warm-beige/40">
                          <div>
                            <p className="font-semibold text-sm text-dark-brown">{item.name}</p>
                            <p className="text-xs text-muted-brown mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-serif font-bold text-sm text-dark-brown">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <Link
                        href={`/order-success?id=${order._id}`}
                        className="text-xs font-semibold text-burnt-orange hover:text-dark-brown transition-colors flex items-center gap-1"
                      >
                        View Full Receipt
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                    {/* Tracker */}
                    <OrderTracker status={order.orderStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
