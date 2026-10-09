import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "../utils/cn";
import { LineReveal, Reveal, SectionLabel, Serif } from "./ui";

const services = [
  {
    t: "Web Design",
    d: "Bespoke, brand-led interfaces designed around your customers and the actions you want them to take. No templates — ever.",
    tags: ["UX strategy", "UI design", "Design systems", "Prototyping"],
    img: "/images/work-1.jpg",
  },
  {
    t: "Development",
    d: "Pixel-perfect, lightning-fast builds on modern stacks with a CMS your team will actually enjoy using.",
    tags: ["React / Next.js", "Webflow", "Headless CMS", "Integrations"],
    img: "/images/work-2.jpg",
  },
  {
    t: "E-commerce",
    d: "Sensorial storefronts with frictionless checkouts engineered to lift average order value and repeat purchases.",
    tags: ["Shopify", "Headless commerce", "Checkout UX", "Subscriptions"],
    img: "/images/work-3.jpg",
  },
  {
    t: "Immersive 3D",
    d: "WebGL, motion and interactive storytelling that make your brand impossible to forget — without sacrificing speed.",
    tags: ["WebGL / Three.js", "Motion design", "Scroll storytelling", "Micro-interactions"],
    img: "/images/work-4.jpg",
  },
  {
    t: "SEO & Growth",
    d: "Technical SEO, analytics and conversion optimization that keep your site climbing long after launch.",
    tags: ["Technical SEO", "CRO & A/B tests", "Analytics", "Care plans"],
    img: "/images/work-5.jpg",
  },
];

export function Services() {
  const [open, setOpen] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = pos.current;
      p.cx += (p.x - p.cx) * 0.12;
      p.cy += (p.y - p.cy) * 0.12;
      if (preview.current) {
        const rot = (p.x - p.cx) * 0.04;
        preview.current.style.transform = `translate(${p.cx}px, ${p.cy}px) translate(-50%, -50%) rotate(${rot}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const move = (e: PointerEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };
    window.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <section id="services" className="relative py-24 sm:py-36">
      <div className="mx-auto w-full max-w-[1800px] px-6 sm:px-12 lg:px-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <SectionLabel n="04">Services</SectionLabel>
            <LineReveal
              className="mt-8 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-7xl lg:text-[7.5rem]"
              lines={["What we", <><Serif className="iri">do</Serif> best.</>]}
            />
          </div>
          <Reveal delay={200}>
            <p className="max-w-sm text-zinc-400">
              One senior team covering every discipline your website needs — from first sketch to final deploy, and every optimization after.
            </p>
          </Reveal>
        </div>

        <ul className="mt-20 border-t border-white/10" onMouseLeave={() => setHover(null)}>
          {services.map((s, i) => {
            const isOpen = open === i;
            return (
              <Reveal as="li" key={s.t} delay={i * 70} className="border-b border-white/10">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  onMouseEnter={() => setHover(i)}
                  aria-expanded={isOpen}
                  aria-controls={`svc-${i}`}
                  className="group relative flex w-full items-center gap-6 py-7 text-left sm:py-9"
                >
                  <span className="label w-10 shrink-0 text-zinc-600">0{i + 1}</span>
                  <span
                    className={cn(
                      "flex-1 font-display text-4xl font-semibold tracking-[-0.04em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-6xl lg:text-7xl",
                      hover !== null && hover !== i ? "text-zinc-700" : "text-bone",
                      "group-hover:translate-x-3"
                    )}
                  >
                    {s.t}
                  </span>
                  <span className="hidden flex-wrap justify-end gap-2 lg:flex lg:max-w-xs">
                    {s.tags.slice(0, 2).map((t) => (
                      <span key={t} className="label rounded-full border border-white/10 px-3 py-1.5 text-zinc-500">{t}</span>
                    ))}
                  </span>
                  <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 transition-all duration-500", isOpen ? "rotate-45 bg-bone text-ink" : "group-hover:bg-white/10")}>
                    <Plus className="h-5 w-5" />
                  </span>
                </button>
                <div id={`svc-${i}`} role="region" className={cn("grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden">
                    <div className="grid gap-6 pb-10 pl-16 sm:grid-cols-2">
                      <p className="max-w-lg text-lg leading-relaxed text-zinc-400">{s.d}</p>
                      <div className="flex flex-wrap content-start gap-2">
                        {s.tags.map((t) => (
                          <span key={t} className="glass rounded-full px-4 py-2 text-sm text-zinc-300">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>

      {/* cursor-follow preview (desktop) */}
      <div
        ref={preview}
        aria-hidden
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-40 hidden h-56 w-80 overflow-hidden rounded-2xl transition-[opacity,scale] duration-500 lg:block",
          hover !== null && open === null ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}
      >
        {services.map((s, i) => (
          <img
            key={s.t}
            src={s.img}
            alt=""
            className={cn("absolute inset-0 h-full w-full object-cover transition-all duration-700", hover === i ? "scale-100 opacity-100" : "scale-110 opacity-0")}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------------- Process (sticky stacking) ---------------- */
const steps = [
  { n: "01", t: "Discover", w: "Week 1", d: "Deep-dive workshops into your business, customers and competitors. We define goals, KPIs and a conversion strategy before a single pixel is drawn.", g: "from-violet-500/30 via-violet-500/5" },
  { n: "02", t: "Design", w: "Week 1–2", d: "Moodboards, wireframes and high-fidelity designs crafted around your brand — refined together until every detail feels inevitable.", g: "from-fuchsia-500/30 via-fuchsia-500/5" },
  { n: "03", t: "Develop", w: "Week 2–3", d: "Pixel-perfect, accessible and blazing-fast code with motion, CMS and integrations. Tested across every device and browser.", g: "from-sky-500/30 via-sky-500/5" },
  { n: "04", t: "Launch & Grow", w: "Week 4+", d: "We launch, measure and iterate. Analytics, SEO and CRO keep your website compounding results month after month.", g: "from-emerald-500/30 via-emerald-500/5" },
];

export function Process() {
  return (
    <section id="process" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionLabel n="05">Process</SectionLabel>
              <LineReveal
                className="mt-8 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-7xl"
                lines={["From idea", <>to <Serif className="iri">impact</Serif></>, "in 4 weeks."]}
              />
              <Reveal delay={200}>
                <p className="mt-8 max-w-sm text-zinc-400">
                  A proven, transparent process with a dedicated senior team, fixed pricing and zero surprises. You're involved at every milestone.
                </p>
              </Reveal>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-7">
            {steps.map((s, i) => (
              <div key={s.n} className="sticky" style={{ top: `calc(6rem + ${i * 1.5}rem)` }}>
                <Reveal>
                  <article className={cn("relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br to-[#0c0c12] p-8 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.9)] sm:p-10", s.g)}>
                    <div className="absolute inset-0 bg-[#0b0b10]/70 backdrop-blur-xl" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="label text-zinc-500">Step {s.n}</span>
                        <span className="label rounded-full border border-white/10 px-3 py-1.5 text-zinc-400">{s.w}</span>
                      </div>
                      <div className="mt-12 flex items-end justify-between gap-6 sm:mt-20">
                        <h3 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">{s.t}</h3>
                        <span className="outline-text font-display text-7xl font-semibold leading-none sm:text-9xl" aria-hidden>{s.n}</span>
                      </div>
                      <p className="mt-6 max-w-lg text-zinc-400">{s.d}</p>
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
