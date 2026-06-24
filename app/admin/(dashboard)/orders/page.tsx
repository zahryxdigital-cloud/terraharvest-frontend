"use client";

import { useEffect, useState, useCallback } from "react";
import React from "react";
import api from "../../../lib/api";
import Toast from "../../../components/admin/Toast";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  totalAmount: number;
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  createdAt: string;
  addressLine1: string;
  city: string;
  state: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders?limit=100");
      setOrders(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}`, { orderStatus: newStatus });
      setToast({ message: `Order status updated to ${newStatus}`, type: "success" });
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? { ...order, orderStatus: newStatus as any } : order))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      setToast({ message: msg, type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gold/20 text-gold";
      case "confirmed": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-burnt-orange/20 text-burnt-orange";
      case "delivered": return "bg-olive/20 text-olive-dark";
      case "cancelled": return "bg-terracotta/20 text-terracotta";
      default: return "bg-warm-beige text-muted-brown";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-dark-brown">Orders</h1>
          <p className="text-sm text-muted-brown mt-1">
            {loading ? "Loading…" : `${orders.length} total orders`}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 border border-warm-beige bg-cream text-dark-brown rounded-xl font-semibold text-sm hover:bg-parchment transition-colors shadow-sm disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-cream rounded-2xl border border-warm-beige shadow-sm overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center text-muted-brown">
            <div className="w-8 h-8 border-2 border-burnt-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-muted-brown font-medium mb-1">No orders found</p>
            <p className="text-sm text-sand mb-5">Wait for customers to place orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-beige bg-parchment/60">
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Order Details</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Customer</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Items</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Total</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-brown">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-beige/50">
                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                  <tr className={`hover:bg-parchment/30 transition-colors ${expandedOrderId === order._id ? "bg-parchment/30" : ""}`}>
                    {/* Order Details */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                          className={`p-1 rounded-md transition-colors ${
                            expandedOrderId === order._id ? "bg-burnt-orange/10 text-burnt-orange" : "hover:bg-warm-beige/30 text-muted-brown"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${expandedOrderId === order._id ? "rotate-90" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div>
                          <p className="font-semibold text-dark-brown font-mono">#{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-[0.65rem] text-muted-brown mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-dark-brown">{order.customerName}</p>
                        <p className="text-xs text-muted-brown truncate max-w-[150px]">{order.city}, {order.state}</p>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-1 bg-parchment border border-warm-beige rounded font-medium text-xs text-dark-brown">
                        {order.items.reduce((a, c) => a + c.quantity, 0)} items
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 text-right font-serif font-bold text-burnt-orange">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>

                    {/* Status Display */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Status Update Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end relative">
                        <select
                          className="text-xs bg-cream border border-warm-beige rounded-lg px-2 py-1.5 focus:outline-none focus:border-burnt-orange text-dark-brown disabled:opacity-50"
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingId === order._id || order.orderStatus === "delivered" || order.orderStatus === "cancelled"}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updatingId === order._id && (
                          <div className="absolute right-0 -mr-6 top-1.5">
                            <svg className="w-4 h-4 animate-spin text-burnt-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Item Details */}
                  {expandedOrderId === order._id && (
                    <tr className="bg-parchment/10">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="bg-cream/50 border border-warm-beige/40 rounded-2xl p-5 shadow-inner">
                          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-muted-brown mb-4 flex items-center gap-2">
                            <span>📦</span> Ordered Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={`${order._id}-${idx}`} className="flex items-center justify-between py-2 border-b border-warm-beige/30 last:border-0">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-parchment flex items-center justify-center text-xs border border-warm-beige/50">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-dark-brown">{item.name}</p>
                                    <p className="text-[0.7rem] text-muted-brown">
                                      {item.quantity} × ₹{item.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-dark-brown">₹{(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-warm-beige flex justify-between items-center text-dark-brown">
                            <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                            <span className="font-serif font-black text-lg">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                          
                          <div className="mt-5 grid grid-cols-2 gap-8">
                            <div>
                              <h5 className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-brown mb-2">Shipping Address</h5>
                              <p className="text-xs text-dark-brown leading-relaxed">
                                {order.customerName}<br />
                                {order.addressLine1}<br />
                                {order.city}, {order.state}<br />
                                {order.email} | {order.phone}
                              </p>
                            </div>
                            <div className="text-right">
                               <h5 className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-brown mb-2">Order Info</h5>
                               <p className="text-xs text-dark-brown">
                                 ID: <span className="font-mono text-[0.6rem]">{order._id}</span><br />
                                 Placed: {new Date(order.createdAt).toLocaleString()}<br />
                                 Status: <span className="capitalize font-bold">{order.orderStatus}</span>
                               </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
