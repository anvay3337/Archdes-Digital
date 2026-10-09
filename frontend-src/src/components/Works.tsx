import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Serif, useScrollProgress } from "./ui";

export const projects = [
  {
    name: "House of Archdes — Atelier",
    cat: "Luxury Interior & Spatial Design",
    year: "2025",
    img: "/assets/portfolio/house-of-archdes-intro.jpg",
    metric: "Bespoke",
    ml: "Millwork & Lighting",
  },
  {
    name: "Modern Modules",
    cat: "Modular Architecture & Prefab Design",
    year: "2025",
    img: "/assets/portfolio/modern-modules.jpg",
    metric: "Prefab",
    ml: "Parametric Facades",
  },
  {
    name: "HouseOfArchdes",
    cat: "Architecture & Turnkey Interiors",
    year: "2025",
    img: "/assets/portfolio/house-of-archdes.jpg",
    metric: "Turnkey",
    ml: "Spatial Architecture",
  },
  {
    name: "HOA Client Portal",
    cat: "Architectural Ecosystem & Web App",
    year: "2025",
    img: "/assets/portfolio/hoa-portal-intro.png",
    metric: "3D App",
    ml: "Interactive Client Portal",
  },
  {
    name: "AnvAI Spatial Engine",
    cat: "AI-Driven Generative Architecture",
    year: "2024",
    img: "/assets/portfolio/anvai-intro.png",
    metric: "AI 3D",
    ml: "Algorithmic Geometry",
  },
  {
    name: "AMR Analyst AI",
    cat: "Spatial Analytics & 3D Intelligence",
    year: "2024",
    img: "/assets/portfolio/amr-analyst-ai-intro.png",
    metric: "Digital Twin",
    ml: "Data Visualization",
  },
];

export default function Works() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const [height, setHeight] = useState<number | null>(null);
  const [idx, setIdx] = useState(1);

  useEffect(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      setHeight(t.scrollWidth - window.innerWidth + window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useScrollProgress(
    section,
    (p) => {
      const t = track.current;
      if (!t) return;
      const dist = t.scrollWidth - window.innerWidth;
      t.style.transform = `translate3d(${-p * dist}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      imgs.current.forEach((img) => {
        if (!img) return;
        const r = img.parentElement!.getBoundingClientRect();
        const c = (r.left + r.width / 2 - window.innerWidth / 2) / window.innerWidth;
        img.style.transform = `translate3d(${c * -4}%,0,0)`;
      });
      setIdx(Math.min(projects.length, Math.max(1, Math.round(p * (projects.length - 1)) + 1)));
    },
    "pinned"
  );

  return (
    <section ref={section} id="works" aria-label="Selected works" style={{ height: height ?? "500vh" }} className="relative">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/4 top-1/3 h-[50vh] w-[50vw] rounded-full bg-indigo-600/10 blur-[140px]" aria-hidden />

        <div ref={track} className="flex w-max items-center gap-6 pl-5 pr-[10vw] will-change-transform sm:gap-10 sm:pl-8">
          {/* intro */}
          <div className="flex w-[85vw] shrink-0 flex-col justify-center sm:w-[60vw] lg:w-[45vw]">
            <div className="flex items-center gap-3 text-zinc-400">
              <span className="label text-zinc-500">(01)</span>
              <span className="h-px w-10 bg-zinc-700" />
              <span className="label">Selected works 2023 — 2025</span>
            </div>
            <h2 className="mt-6 font-display text-[22vw] font-semibold leading-[0.82] tracking-[-0.06em] sm:text-[14vw] lg:text-[11vw]">
              Wor<Serif className="iri">ks</Serif>
            </h2>
            <p className="mt-8 max-w-sm text-zinc-400">
              A curated selection of websites we've designed and engineered for brands that refuse to blend in. Keep scrolling →
            </p>
          </div>

          {projects.map((p, i) => (
            <a
              key={p.name}
              href="#contact"
              data-cursor="View"
              className="group relative block w-[82vw] shrink-0 sm:w-[62vw] lg:w-[48vw]"
              aria-label={`${p.name} — ${p.cat}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-[#0c0d14] p-2 sm:p-3 border border-white/10 transition-all duration-500 group-hover:border-white/20">
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
                  <img
                    ref={(el) => {
                      imgs.current[i] = el;
                    }}
                    src={p.img}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-[filter,transform] duration-700 group-hover:scale-[1.02] group-hover:brightness-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80 pointer-events-none" />
                </div>
                <div className="absolute left-5 top-5 flex gap-2">
                  <span className="glass label rounded-full px-3 py-1.5 text-zinc-200">{p.year}</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div className="translate-y-2 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{p.metric}</p>
                    <p className="label mt-1 text-zinc-300">{p.ml}</p>
                  </div>
                  <span className="grid h-12 w-12 scale-75 place-items-center rounded-full bg-bone text-ink opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  <span className="label mr-3 align-middle text-zinc-600">0{i + 1}</span>
                  {p.name}
                </h3>
                <span className="label shrink-0 text-zinc-500">{p.cat}</span>
              </div>
            </a>
          ))}

          {/* outro */}
          <div className="flex w-[80vw] shrink-0 flex-col items-start justify-center sm:w-[50vw] lg:w-[36vw]">
            <p className="label text-zinc-500">Next up</p>
            <h3 className="mt-4 font-display text-6xl font-semibold leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Your brand<br />
              <Serif className="iri">could be here.</Serif>
            </h3>
            <a href="#contact" className="group mt-10 inline-flex items-center gap-3 text-lg">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 transition-all duration-500 group-hover:rotate-45 group-hover:bg-bone group-hover:text-ink">
                <ArrowUpRight className="h-5 w-5" />
              </span>
              Start your project
            </a>
          </div>
        </div>

        {/* progress */}
        <div className="absolute inset-x-5 bottom-8 flex items-center gap-4 sm:inset-x-8">
          <span className="label tabular-nums text-zinc-400">0{idx}</span>
          <div className="h-px flex-1 bg-white/10">
            <div ref={bar} className="h-full origin-left bg-bone" style={{ transform: "scaleX(0)" }} />
          </div>
          <span className="label tabular-nums text-zinc-600">0{projects.length}</span>
        </div>
      </div>
    </section>
  );
}
