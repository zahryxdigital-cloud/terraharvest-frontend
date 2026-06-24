"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="relative py-24 sm:py-32 bg-cream overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-olive/5 blur-3xl" />

      <div
        ref={sectionRef}
        className="max-w-7xl mx-auto px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div
            className={`relative ${
              visible ? "animate-slide-left" : "opacity-0"
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-dark-brown/10">
              <div className="aspect-[4/5] relative">
                <Image
                  src="/images/product-mangoes.png"
                  alt="Artisanal dehydration process in our workshop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/30 to-transparent" />
              </div>
            </div>

            {/* Floating vintage stamp */}
            <div className="absolute -top-6 -right-4 sm:-right-6 z-10">
              <div className="vintage-stamp bg-cream shadow-lg animate-stamp">
                Since 2019
              </div>
            </div>

            {/* Stats overlay card */}
            <div className="absolute -bottom-6 -left-4 sm:-left-6 z-10 glass-card rounded-xl p-5 shadow-xl max-w-[200px]">
              <div className="text-3xl font-serif font-bold text-dark-brown">
                5000+
              </div>
              <div className="text-sm text-muted-brown mt-1">
                Happy customers across the country
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div
            className={`space-y-8 ${
              visible ? "animate-slide-right" : "opacity-0"
            }`}
          >
            <div>
              <span className="inline-block px-4 py-1.5 border border-gold/40 rounded-full text-xs tracking-[0.2em] uppercase text-muted-brown font-medium mb-4">
                Our Story
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-dark-brown leading-tight mb-2">
                From Farm
                <br />
                <span className="text-burnt-orange italic font-normal">
                  to Your Table
                </span>
              </h2>
              <div className="vintage-divider !mx-0 !max-w-[200px] mt-4">
                <span className="vintage-divider-icon">✦</span>
              </div>
            </div>

            <div className="space-y-5 text-muted-brown leading-relaxed text-base">
              <p>
                Born in the sun-drenched orchards of the countryside,{" "}
                <strong className="text-dark-brown font-semibold">
                  Terra Harvest
                </strong>{" "}
                began as a family&rsquo;s passion for preserving the purest
                flavors of nature. We believe every fruit tells a story — of the
                soil, the sunshine, and the hands that grew it.
              </p>
              <p>
                Our slow-dehydration process locks in nutrients and intensifies
                the natural sweetness, creating snacks that are as wholesome as
                they are delicious. No sugar added, no preservatives — just the
                honest goodness of real fruit.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "100%", label: "Organic Sourced" },
                { number: "Zero", label: "Preservatives" },
                { number: "48hr", label: "Slow Dehydration" },
                { number: "Farm", label: "Direct Partnership" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-parchment/60 border border-warm-beige/50"
                >
                  <div className="text-xl font-serif font-bold text-dark-brown">
                    {item.number}
                  </div>
                  <div className="text-xs text-muted-brown tracking-wide mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-burnt-orange font-semibold transition-colors hover:text-burnt-orange-dark group"
            >
              Learn More About Us
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
