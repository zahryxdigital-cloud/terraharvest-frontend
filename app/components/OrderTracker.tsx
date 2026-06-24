/* ─── Order Status Tracker Component ──────────────────────────────────────────
   A visual progress bar showing the lifecycle of an order.
   Usage: <OrderTracker status="shipped" />
─────────────────────────────────────────────────────────────────────────── */

interface OrderTrackerProps {
  status: string;
  cancelledAt?: string;
}

const STEPS = [
  { key: "pending",   label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed",    icon: "✅" },
  { key: "shipped",   label: "Shipped",      icon: "🚚" },
  { key: "delivered", label: "Delivered",    icon: "🏠" },
];

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderTracker({ status, cancelledAt }: OrderTrackerProps) {
  const isCancelled = status === "cancelled";
  const currentIndex = isCancelled ? -1 : STATUS_ORDER.indexOf(status);

  if (isCancelled) {
    return (
      <div className="mt-4 pt-4 border-t border-warm-beige/60">
        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-brown mb-3">Order Status</p>
        <div className="flex items-center gap-3 bg-terracotta/5 border border-terracotta/20 rounded-2xl p-4">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-bold text-terracotta text-sm">Order Cancelled</p>
            <p className="text-xs text-muted-brown">This order has been cancelled.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-warm-beige/60">
      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-brown mb-4">Shipment Progress</p>

      {/* Desktop: Horizontal Stepper */}
      <div className="hidden sm:flex items-center">
        {STEPS.map((step, idx) => {
          const isDone    = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-initial">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all duration-500 ${
                    isDone
                      ? "bg-olive border-olive text-cream shadow-md"
                      : "bg-cream border-warm-beige text-muted-brown opacity-50"
                  } ${isCurrent ? "ring-4 ring-olive/20 scale-110" : ""}`}
                >
                  {step.icon}
                </div>
                <p className={`text-[0.6rem] font-bold mt-2 uppercase tracking-wider text-center leading-tight max-w-[60px] ${isDone ? "text-olive-dark" : "text-muted-brown opacity-50"}`}>
                  {step.label}
                </p>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-1 h-0.5 relative overflow-hidden rounded-full bg-warm-beige">
                  <div
                    className="absolute inset-y-0 left-0 bg-olive transition-all duration-700 ease-out rounded-full"
                    style={{ width: idx < currentIndex ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical list */}
      <div className="flex sm:hidden flex-col gap-3">
        {STEPS.map((step, idx) => {
          const isDone    = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.key} className={`flex items-center gap-3 ${isDone ? "opacity-100" : "opacity-40"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 shrink-0 ${isDone ? "bg-olive border-olive text-cream" : "bg-cream border-warm-beige"} ${isCurrent ? "ring-2 ring-olive/30" : ""}`}>
                {step.icon}
              </div>
              <p className={`text-xs font-semibold ${isCurrent ? "text-dark-brown" : "text-muted-brown"}`}>
                {step.label}
              </p>
              {isCurrent && (
                <span className="ml-auto text-[0.6rem] font-bold bg-olive/10 text-olive-dark px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
