"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";

interface StatsCard {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  color: string;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats: StatsCard[] = [
    {
      label: "Total Revenue",
      value: loading ? "—" : (data ? `₹${data.totalRevenue.toFixed(2)}` : "—"),
      icon: "💰",
      sub: "All time",
      color: "border-burnt-orange/20 bg-burnt-orange/5",
    },
    {
      label: "Total Orders",
      value: loading ? "—" : (data?.totalOrders ?? "—"),
      icon: "🛒",
      sub: "All time",
      color: "border-olive/20 bg-olive/5",
    },
    {
      label: "Total Products",
      value: loading ? "—" : (data?.totalProducts ?? "—"),
      icon: "📦",
      sub: "Active catalogue",
      color: "border-gold/20 bg-gold/5",
    },
    {
      label: "Registered Users",
      value: loading ? "—" : (data?.totalUsers ?? "—"),
      icon: "👥",
      sub: "Customer accounts",
      color: "border-dark-brown/10 bg-dark-brown/5",
    },
  ];

  const quickLinks = [
    { label: "Add New Product", href: "/admin/products/add", icon: "➕", desc: "Add a product to the catalogue" },
    { label: "View Products", href: "/admin/products", icon: "📋", desc: "Manage existing products" },
    { label: "View Storefront", href: "/", icon: "🏪", desc: "See what customers see" },
    { label: "Shop Page", href: "/products", icon: "🛍️", desc: "Browse the product listing" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-dark-brown mb-1">Dashboard</h1>
        <p className="text-sm text-muted-brown">Welcome back, Admin. Here's your store at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-5 flex flex-col gap-3 shadow-sm ${s.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[0.65rem] tracking-widest uppercase text-muted-brown font-semibold">
                {s.label}
              </span>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-dark-brown">{s.value}</p>
              {s.sub && <p className="text-xs text-muted-brown mt-0.5">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-serif text-xl font-semibold text-dark-brown mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-cream border border-warm-beige rounded-2xl p-5 hover:border-burnt-orange/40 hover:shadow-md hover:shadow-burnt-orange/10 transition-all duration-300"
            >
              <span className="text-2xl block mb-3">{link.icon}</span>
              <p className="font-semibold text-dark-brown text-sm mb-1 group-hover:text-burnt-orange transition-colors">
                {link.label}
              </p>
              <p className="text-xs text-muted-brown">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      {data && data.recentOrders && data.recentOrders.length > 0 && (
        <div className="bg-cream border border-warm-beige/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-dark-brown">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-burnt-orange hover:text-dark-brown transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-warm-beige/30 text-muted-brown uppercase tracking-widest text-[0.65rem]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 rounded-r-lg font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-beige/60">
                {data.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-warm-beige/10 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-muted-brown">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 text-dark-brown">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-dark-brown font-medium">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-4 font-serif font-bold text-dark-brown">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest ${
                        order.orderStatus === "pending" ? "bg-gold/20 text-gold" :
                        order.orderStatus === "delivered" ? "bg-olive/20 text-olive-dark" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
