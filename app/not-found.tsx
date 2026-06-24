import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-parchment/40 flex items-center justify-center px-6">

        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-warm-beige/40 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gold/20 blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-lg py-20">

          {/* Vintage stamp circle */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-gold/40 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-gold/30 flex items-center justify-center flex-col gap-1">
                <span className="font-serif text-5xl font-black text-burnt-orange leading-none">404</span>
                <span className="text-[0.5rem] font-bold uppercase tracking-[0.25em] text-muted-brown">Not Found</span>
              </div>
            </div>
            {/* Decorative dots */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                style={{ transform: `rotate(${deg}deg) translateY(-90px)` }}
                className="absolute w-1.5 h-1.5 rounded-full bg-gold/50"
              />
            ))}
          </div>

          {/* Ornament */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <span className="text-gold text-lg">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-dark-brown mb-4 leading-tight">
            Lost in the Orchard?
          </h1>

          <p className="text-muted-brown text-lg leading-relaxed mb-3">
            The page you're looking for seems to have been dehydrated away.
          </p>
          <p className="text-sm text-muted-brown/70 mb-10">
            Double-check the URL, or use the links below to find your way back.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-dark-brown text-cream rounded-full font-semibold text-sm hover:bg-espresso transition-all hover:shadow-lg hover:shadow-dark-brown/20 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-cream border-2 border-warm-beige text-dark-brown rounded-full font-semibold text-sm hover:border-burnt-orange hover:text-burnt-orange transition-all"
            >
              Browse Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Bottom label */}
          <p className="mt-12 text-[0.65rem] uppercase tracking-[0.2em] text-muted-brown/50 font-medium">
            Terra Harvest · Est. 2024
          </p>
        </div>

      </main>
      <Footer />
    </>
  );
}
