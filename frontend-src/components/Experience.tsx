import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { cn } from "../utils/cn";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/* ---------------- Smooth scroll ---------------- */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const el = document.querySelector(id) as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === "#top" ? 0 : -20 });
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);
  return null;
}

/* ---------------- Preloader ---------------- */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [exit, setExit] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    let raf = 0;
    const start = performance.now();
    const dur = 2000;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setExit(true);
          onDone();
          document.documentElement.style.overflow = "";
          window.__lenis?.start();
        }, 250);
        setTimeout(() => setGone(true), 1600);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;
  return (
    <div
      role="status"
      aria-label={`Loading ${count}%`}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 transition-[clip-path] duration-[1200ms] ease-[cubic-bezier(0.76,0,0.24,1)] sm:p-10",
        exit ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(0_0_0_0)]"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label text-zinc-500">Archdes Digital</span>
        <span className="label text-zinc-500">Web Design Studio — Est. 2019</span>
      </div>
      <div className="relative">
        <p className="font-display text-[11vw] font-semibold leading-none tracking-[-0.05em] text-zinc-800 sm:text-[9vw]">
          <span className="relative inline-block">
            archdes
            <span
              className="chrome absolute inset-0 overflow-hidden whitespace-nowrap"
              style={{ clipPath: `inset(0 ${100 - count}% 0 0)` }}
              aria-hidden
            >
              archdes
            </span>
          </span>
        </p>
      </div>
      <div className="flex items-end justify-between">
        <span className="label max-w-[14rem] text-zinc-500">Crafting digital worlds that move people & grow businesses.</span>
        <span className="font-display text-6xl font-medium tabular-nums tracking-tight sm:text-8xl">
          {String(count).padStart(3, "0")}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10">
        <div className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}

/* ---------------- Cursor ---------------- */
/* ---------------- Standard Browser Cursor ---------------- */
export function Cursor() {
  return null;
}

/* ---------------- Scroll progress ---------------- */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[80] h-[2px]" aria-hidden>
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
