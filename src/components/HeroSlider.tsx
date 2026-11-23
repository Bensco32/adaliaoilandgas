"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/images/Oil refinery Photos - Download Free High-Quality Pictures _ Freepik.jpg",
    alt: "Gas flares burning at an oil and gas processing facility at dusk",
    headline: "POWERING THE FUTURE OF ENERGY.",
    text: "Delivering integrated drilling, crude lifting, gas and petroleum solutions across Nigeria and international markets."
  },
  {
    image: "/images/ship.jpg",
    alt: "Large crude oil tanker ship navigating offshore waters",
    headline: "CONNECTING ENERGY TO THE WORLD.",
    text: "Reliable crude lifting, marine transportation, vessel chartering and logistics solutions."
  },
  {
    image: "/images/Venezuela’s Oil Revival_ Can a Giant Rise Again_.jpg",
    alt: "Engineers in hard hats operating pipeline valves with pumpjacks at sunset",
    headline: "EXCELLENCE BUILT ON EXPERTISE.",
    text: "Experienced professionals delivering safe, efficient and dependable energy operations."
  },
  {
    image: "/images/Glowing Earth with Orbital Light Trails (2).png",
    alt: "Glowing Earth with orbital light trails representing global energy reach",
    headline: "ENERGY SOLUTIONS WITHOUT BOUNDARIES.",
    text: "Comprehensive gas and petroleum supply solutions for businesses, industries and communities."
  }
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className="relative h-[90vh] min-h-[560px] w-full overflow-hidden bg-navy-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero showcase"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.06 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <Image src={slides[index].image} alt={slides[index].alt} fill priority unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 md:px-6">
        <div className="max-w-3xl pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-gold-400">ADALIA OIL AND GAS LTD</p>
              <h1 className="text-balance text-4xl font-extrabold leading-tight text-white md:text-6xl">
                {slides[index].headline}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/85 md:text-xl">{slides[index].text}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/services" className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400 transition">
                  Explore Our Services
                </Link>
                <Link href="/contact" className="rounded-md border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition">
                  Contact Our Team
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 md:left-6">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 md:right-6">
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-gold-500" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </section>
  );
}
