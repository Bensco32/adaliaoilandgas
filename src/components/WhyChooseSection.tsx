"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Layers, Users, ShieldCheck, Zap, Handshake, Globe } from "lucide-react";
import { whyChoose } from "@/data/company";

const icons = [Layers, Users, ShieldCheck, Zap, Handshake, Globe];

// Entrance direction for each card.
// x3/y3: desktop three-column layout (left / top / right / bottom).
// x2/y2: tablet two-column layout (left column / right column).
const directions = [
  { x3: "-55vw", y3: "0px", x2: "-55vw", y2: "0px" },
  { x3: "0px", y3: "-45vh", x2: "55vw", y2: "0px" },
  { x3: "55vw", y3: "0px", x2: "-55vw", y2: "0px" },
  { x3: "-55vw", y3: "0px", x2: "55vw", y2: "0px" },
  { x3: "0px", y3: "45vh", x2: "-55vw", y2: "0px" },
  { x3: "55vw", y3: "0px", x2: "55vw", y2: "0px" }
];

export function WhyChooseSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 640px)");

    // Drives the cards directly from scroll progress. Only one style write per frame.
    const setupScroll = () => {
      let frame = 0;

      const update = () => {
        frame = 0;
        const rect = stage.getBoundingClientRect();
        const travel = stage.offsetHeight - window.innerHeight;
        if (travel <= 0) return;

        const raw = Math.min(1, Math.max(0, -rect.top / travel));
        // smoothstep: eases in and settles gently into the final position
        const eased = raw * raw * (3 - 2 * raw);
        stage.style.setProperty("--why-progress", eased.toFixed(4));
      };

      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };

      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frame) cancelAnimationFrame(frame);
      };
    };

    // Mobile / reduced motion: simple one-time vertical entrance, no sticky scroll.
    const setupReveal = () => {
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

      if (motionQuery.matches) {
        cards.forEach((card) => card.classList.add("is-visible"));
        return () => {};
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      cards.forEach((card) => observer.observe(card));
      return () => observer.disconnect();
    };

    let cleanup = () => {};

    const apply = () => {
      cleanup();
      cleanup =
        desktopQuery.matches && !motionQuery.matches ? setupScroll() : setupReveal();
    };

    apply();
    desktopQuery.addEventListener("change", apply);
    motionQuery.addEventListener("change", apply);

    return () => {
      desktopQuery.removeEventListener("change", apply);
      motionQuery.removeEventListener("change", apply);
      cleanup();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="why-choose-stage relative bg-navy-900 h-[180vh] overflow-x-clip"
      style={{ "--why-progress": 0 } as CSSProperties}
    >
      <div className="why-choose-sticky sticky top-0 flex h-screen items-center bg-navy-900">
        <section className="section-padding bg-navy-900 text-white w-full">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">Our Strength</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">WHY CHOOSE ADALIA?</h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyChoose.map((item, i) => {
                const Icon = icons[i];
                const direction = directions[i] ?? directions[0];

                return (
                  <div
                    key={item}
                    ref={(node) => {
                      cardRefs.current[i] = node;
                    }}
                    className="why-choose-card rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                    style={
                      {
                        "--dx3": direction.x3,
                        "--dy3": direction.y3,
                        "--dx2": direction.x2,
                        "--dy2": direction.y2
                      } as CSSProperties
                    }
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-gold-500/15 p-3 text-gold-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-medium leading-snug">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
