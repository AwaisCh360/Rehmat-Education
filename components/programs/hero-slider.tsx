"use client";

import { useEffect, useMemo, useState } from "react";

export function HeroSlider({ slides }: { slides: string[] }) {
  const safeSlides = useMemo(() => slides.filter((item) => item.trim().length > 0), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [safeSlides.length]);

  useEffect(() => {
    if (safeSlides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeSlides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [safeSlides.length]);

  if (!safeSlides.length) {
    return (
      <div className="relative w-full h-[60px] overflow-hidden rounded-2xl border border-border/70 bg-[linear-gradient(125deg,rgba(15,23,42,0.95),rgba(8,47,73,0.85))] lg:h-[90px]">
        <div className="flex h-full items-center justify-center text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Add slideshow images from admin settings
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60px] overflow-hidden rounded-2xl border border-border/70 bg-slate-950 lg:h-[90px]">
      {safeSlides.map((slide, index) => (
        <img
          key={`${slide.slice(0, 24)}-${index}`}
          alt={`Hero slide ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
          src={slide}
        />
      ))}

      {safeSlides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          {safeSlides.map((_, index) => (
            <button
              key={index}
              aria-label={`Show slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/45"}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
