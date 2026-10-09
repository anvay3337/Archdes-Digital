import { lazy, Suspense, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { cn } from "../utils/cn";
import { Magnetic, Serif, useScrollProgress } from "./ui";

const Scene = lazy(() => import("./Scene"));

export default function Hero({ ready }: { ready: boolean }) {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useScrollProgress(
    section,
    (p) => {
      if (content.current) {
        content.current.style.transform = `translateY(${p * -120}px)`;
        content.current.style.opacity = String(1 - Math.max(0, p - 0.35) * 2.2);
      }
    },
    "through"
  );

  const show = (d: number) => ({ transitionDelay: ready ? `${d}ms` : "0ms" });

  return (
    <section ref={section} id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden">
      {/* ambient */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" aria-hidden />
      <div className={cn("absolute inset-0 transition-opacity duration-[2000ms]", ready ? "opacity-100" : "opacity-0")}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" aria-hidden />

      <div ref={content} className={cn("relative z-10 mx-auto flex h-full w-full max-w-[1800px] flex-col justify-end px-6 pb-8 pt-24 sm:px-12 lg:px-16", ready && "in")}>
        {/* bottom */}
        <div>
          <h1 className="font-display text-[13vw] font-semibold leading-[0.88] tracking-[-0.055em] sm:text-[10.5vw] lg:text-[8.6vw]">
            <span className="line-mask"><span style={show(100)}>We design</span></span>
            <span className="line-mask"><span style={show(200)}>websites that</span></span>
            <span className="line-mask">
              <span style={show(300)}>
                <Serif className="iri pr-[0.06em] tracking-[-0.03em]">move</Serif> markets.
              </span>
            </span>
          </h1>

          <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between">
            <p className={cn("max-w-md text-[15px] leading-relaxed text-zinc-400 transition-all duration-1000", ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={show(600)}>
              Archdes Digital is an independent web design studio crafting immersive, high-converting websites for ambitious businesses — where cinematic design meets measurable growth.
            </p>
            <div className={cn("flex items-center gap-3 transition-all duration-1000", ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={show(750)}>
              <Magnetic>
                <a
                  href="#contact"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-bone px-6 py-3.5 text-sm font-semibold text-ink"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                  <span className="relative">Book a free strategy call</span>
                  <ArrowUpRight className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </a>
              </Magnetic>
              <a href="#works" className="hidden items-center gap-3 sm:flex" aria-label="Scroll to explore works">
                <span className="label text-zinc-400">Scroll to explore</span>
                <span className="relative flex h-px w-8 items-center bg-zinc-700">
                  <span className="animate-scroll-dot absolute h-1.5 w-1.5 rounded-full bg-bone" />
                </span>
                <ArrowDown className="h-4 w-4 text-zinc-400 sm:hidden" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
