"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/** Android/mobile mode (viewport below the Tailwind md breakpoint, 640px):
 * the gallery shows a limited set of pictures until "See all" is clicked. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

const images = [
  { src: "/images/NGP Launches Fund to Invest 500 Million Toward Energy Transition - D CEO Magazine.jpg", alt: "Large oil refinery processing plant illuminated at dusk", desc: "Refinery Processing Plant at Dusk" },
  { src: "/images/Refinery turnaround India.jpg", alt: "Engineer reviewing blueprints in front of a refinery at dusk", desc: "Engineering Review at the Refinery" },
  { src: "/images/Crude Oil Pipe.jpg", alt: "Crude oil flowing from a pipe with a pumpjack at sunset", desc: "Crude Oil Lifting Operations" },
  { src: "/images/Meet SLB_ The 70 billion oil services giant___ (1).jpg", alt: "Drilling technicians working together on a rig floor", desc: "Drilling Crew at Work" },
  { src: "/images/men at work.jpg", alt: "Operations personnel in protective equipment walking through a facility", desc: "Operations Team on Site" },
  { src: "/images/Networking.jpg", alt: "Business handshake representing a strategic partnership", desc: "Strategic Partnership" },
  { src: "/images/Exploring the Life Cycle of Plants.jpg", alt: "Young seedling growing from soil representing environmental sustainability", desc: "Environmental Stewardship" },
  { src: "/images/face.jpg", alt: "Offshore worker in protective equipment with an illuminated platform at sunset", desc: "Offshore Operations at Sunset" },
  { src: "/images/head.jpg", alt: "Stacked drill pipes on a drilling rig floor beneath the derricks", desc: "Drill Pipe Handling on the Rig Floor" },
  { src: "/images/Offshore.jpg", alt: "Offshore crew in life jackets reviewing documents on a vessel deck", desc: "Offshore Crew Briefing on Deck" }
];

export function GallerySection() {
  const [active, setActive] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  // Android mode: the gallery shows a limited set of pictures until "See all".
  // Implemented in CSS (`globals.css`) so nothing is visible before hydration.
  const showToggle = isMobile && images.length > 3;

  return (
    <section id="gallery" className="section-padding bg-navy-900">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">Our Operations in Focus</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">CORPORATE GALLERY</h2>
          <p className="mt-4 text-white/70">A visual showcase of our capabilities across drilling, marine logistics, gas and petroleum operations.</p>
        </div>
        <div className={`mt-12 gallery-grid columns-1 gap-4 sm:columns-2 lg:columns-3${expanded ? " gallery-expanded" : ""}`}>
          {images.map((img, i) => (
            <motion.button
              key={img.src + i}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
              whileTap={{ scale: 0.99, transition: { duration: 0.15, ease: "easeOut" } }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: "easeOut" }}
              onClick={() => setActive(i)}
              className="group relative mb-4 block w-full overflow-hidden rounded-xl text-left"
            >
              <Image src={img.src} alt={img.alt} width={800} height={600} unoptimized className="h-auto w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">{img.desc}</span>
            </motion.button>
          ))}
        </div>
        {showToggle && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="rounded-md border border-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-600 hover:bg-gold-50"
            >
              {expanded ? "See less" : "See all"}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <button className="absolute right-4 top-4 text-white" aria-label="Close" onClick={() => setActive(null)}><X className="h-8 w-8" /></button>
            <motion.div className="relative max-h-[85vh] w-full max-w-5xl" initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }} onClick={(e) => e.stopPropagation()}>
              <Image src={images[active].src} alt={images[active].alt} width={1600} height={1000} unoptimized className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain" />
              <p className="mt-3 text-center text-white/90">{images[active].desc}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
