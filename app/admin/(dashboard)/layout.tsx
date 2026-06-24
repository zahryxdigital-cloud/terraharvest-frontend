import Sidebar from "../../components/admin/Sidebar";
import AdminGuard from "../../components/admin/AdminGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel — Terra Harvest",
  description: "Manage products, orders and inventory",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-parchment/60 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-cream border-b border-warm-beige flex items-center justify-between px-8 shrink-0 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-brown">
              <span className="w-2 h-2 rounded-full bg-olive animate-pulse" />
              Backend connected — localhost:5000
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-dark-brown text-cream flex items-center justify-center text-sm font-bold font-serif">
                A
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-dark-brown leading-none">Admin</p>
                <p className="text-[0.6rem] text-muted-brown mt-0.5">Terra Harvest</p>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
