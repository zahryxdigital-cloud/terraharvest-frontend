"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Wellness Coach",
    quote:
      "Terra Harvest has completely changed how I snack. The mango slices taste like biting into fresh fruit — I always have a bag in my gym bag.",
    rating: 5,
  },
  {
    id: 2,
    name: "James Cooper",
    role: "Home Chef & Foodie",
    quote:
      "The quality is unmatched. I use the orange crisps in my baking and the strawberry bites for charcuterie boards. My guests always ask where I get them.",
    rating: 5,
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Nutritionist",
    quote:
      "As a nutritionist, I recommend Terra Harvest to all my clients. Zero added sugar, packed with natural nutrients — it's the gold standard of dried fruits.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Chen",
    role: "Outdoor Enthusiast",
    quote:
      "Perfect trail snack. Lightweight, long-lasting, and genuinely delicious. The banana chips are my absolute favorite for hiking trips.",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-gold"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-cream">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Background decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-16 ${
            headerVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <span className="inline-block px-4 py-1.5 border border-gold/40 rounded-full text-xs tracking-[0.2em] uppercase text-muted-brown font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-dark-brown mb-4">
            What Our Customers{" "}
            <span className="text-burnt-orange italic font-normal">Say</span>
          </h2>
          <div className="vintage-divider mx-auto mb-6">
            <span className="vintage-divider-icon">✦</span>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative p-8 rounded-2xl bg-parchment/60 border border-warm-beige/50 transition-all duration-500 hover:shadow-xl hover:shadow-muted-brown/8 hover:-translate-y-1 grain-overlay ${
        visible ? "animate-fade-in-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Quote Icon */}
      <div className="relative z-10 absolute -top-3 left-8">
        <div className="w-10 h-10 rounded-full bg-dark-brown flex items-center justify-center shadow-lg">
          <svg
            className="w-5 h-5 text-gold-light"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-4">
        <StarRating count={testimonial.rating} />
        <blockquote className="mt-4 text-dark-brown leading-relaxed font-light text-base italic">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="mt-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-warm-beige border-2 border-gold/30 flex items-center justify-center">
            <span className="font-serif text-lg font-bold text-dark-brown">
              {testimonial.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-dark-brown text-sm">
              {testimonial.name}
            </div>
            <div className="text-xs text-muted-brown tracking-wide">
              {testimonial.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
