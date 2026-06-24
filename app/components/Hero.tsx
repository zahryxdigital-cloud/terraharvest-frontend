"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Hero() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (parallaxRef.current) {
            parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background Image */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(0px)` }}
      >
        <Image
          src="/images/hero-banner.png"
          alt="Beautiful arrangement of premium dehydrated fruits"
          fill
          className="object-cover scale-110"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-espresso/70 via-dark-brown/50 to-espresso/80" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 z-15 opacity-[0.06] pointer-events-none bg-transparent"
      />

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        {/* Vintage badge */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 bg-cream/10 backdrop-blur-sm text-gold-light text-xs tracking-[0.2em] uppercase font-medium">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Handcrafted with care since 2019
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-cream leading-[1.05] tracking-tight mb-6 animate-fade-in-up">
          Naturally Preserved.
          <br />
          <span className="text-gold-light italic font-normal">
            Purely Delicious.
          </span>
        </h1>

        {/* Vintage Divider */}
        <div className="vintage-divider mx-auto mb-8 animate-fade-in delay-200">
          <span className="vintage-divider-icon">✦</span>
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-cream/80 font-light leading-relaxed mb-10 animate-fade-in-up delay-300">
          From sun-kissed orchards to your pantry — our artisanally dehydrated
          fruits capture nature&rsquo;s sweetness at its peak. No additives. No
          compromises. Just pure, wholesome goodness.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-400">
          <a
            href="#products"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-burnt-orange text-cream rounded-full font-semibold text-base transition-all duration-300 hover:bg-burnt-orange-dark hover:shadow-xl hover:shadow-burnt-orange/25 hover:-translate-y-0.5"
          >
            Shop Our Collection
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 px-8 py-4 border border-cream/30 text-cream rounded-full font-medium text-base transition-all duration-300 hover:bg-cream/10 hover:border-cream/50"
          >
            Our Story
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-cream/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-gold-light animate-fade-in" />
          </div>
        </div>
      </div>
    </section>
  );
}
