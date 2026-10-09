import { useEffect, useRef, useState } from "react";
import { Reveal, LineReveal, SectionLabel, Serif, useInView, useScrollProgress } from "./ui";

/* ---------------- Kinetic marquee ---------------- */
export function Kinetic() {
  const section = useRef<HTMLElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  useScrollProgress(section, (p) => {
    if (r1.current) r1.current.style.transform = `translateX(${-10 - p * 30}%)`;
    if (r2.current) r2.current.style.transform = `translateX(${-40 + p * 30}%)`;
  });
  const words = ["Strategy", "Design", "Development", "Motion", "SEO", "Growth"];
  return (
    <section ref={section} aria-hidden className="relative overflow-hidden py-16 sm:py-24">
      <div ref={r1} className="flex w-max gap-10 whitespace-nowrap will-change-transform">
        {[...words, ...words, ...words].map((w, i) => (
          <span key={i} className={i % 2 ? "outline-text font-display text-[16vw] font-semibold leading-none tracking-[-0.05em] sm:text-[10vw]" : "font-display text-[16vw] font-semibold leading-none tracking-[-0.05em] text-zinc-200 sm:text-[10vw]"}>
            {w}
            <span className="mx-6 inline-block text-[0.4em] align-middle text-violet-300">✦</span>
          </span>
        ))}
      </div>
      <div ref={r2} className="mt-2 flex w-max gap-10 whitespace-nowrap will-change-transform">
        {[...words, ...words, ...words].reverse().map((w, i) => (
          <span key={i} className={i % 2 === 0 ? "outline-text font-serif text-[16vw] italic leading-none sm:text-[10vw]" : "iri font-serif text-[16vw] italic leading-none sm:text-[10vw]"}>
            {w}
            <span className="mx-6 inline-block text-[0.4em] align-middle text-zinc-600">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Mission (pinned word reveal) ---------------- */
const mission =
  "We craft immersive, high-performance websites that turn attention into revenue — blending cinematic design, sharp strategy and flawless engineering for businesses ready to lead.";

export function Mission() {
  const section = useRef<HTMLElement>(null);
  const words = mission.split(" ");
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useScrollProgress(
    section,
    (p) => {
      const n = words.length;
      const v = p * 1.25 * n;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const o = Math.min(1, Math.max(0.12, v - i));
        el.style.opacity = String(o);
        el.style.filter = `blur(${(1 - o) * 4}px)`;
      });
    },
    "pinned"
  );

  return (
    <section ref={section} id="mission" className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[60vh] w-[60vh] rounded-full bg-fuchsia-600/10 blur-[140px]" aria-hidden />
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <SectionLabel n="02">Mission</SectionLabel>
          <p className="mt-10 font-display text-[8.5vw] font-medium leading-[1.08] tracking-[-0.035em] sm:text-[5.6vw] lg:text-[4.4vw]">
            {words.map((w, i) => {
              const special = ["immersive,", "revenue", "cinematic", "lead."].includes(w);
              return (
                <span
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className={special ? "font-serif italic iri" : ""}
                  style={{ opacity: 0.12, transition: "opacity .25s linear, filter .25s linear" }}
                >
                  {w}{" "}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Vision + stats ---------------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const s = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - s) / 1800);
      setV(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

const clients = ["Northwind", "Lumora", "Vertex Labs", "Halcyon", "Kinfolk & Co", "Meridian", "Arcadia", "Pulse Health", "Oakridge", "Nova Finance", "Monolith", "Ember & Oak"];

export function Vision() {
  const stats = [
    { to: 180, s: "+", l: "Websites launched" },
    { to: 212, s: "%", l: "Avg. conversion lift" },
    { to: 98, s: "%", l: "Client retention" },
    { to: 27, s: "", l: "Design awards" },
  ];
  return (
    <section className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel n="03">Vision</SectionLabel>
          </div>
          <div className="lg:col-span-8">
            <LineReveal
              className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-8xl"
              lines={[
                "Architect digital",
                <>worlds that <Serif className="iri">move</Serif></>,
                "hearts & grow brands.",
              ]}
            />
            <Reveal delay={300}>
              <p className="mt-10 max-w-xl text-lg leading-relaxed text-zinc-400">
                Your website is the first handshake with every customer. We make sure it's unforgettable — and that it quietly works around the clock to fill your pipeline.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 100} className="border-b border-white/10 py-8 pr-4 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
              <p className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
                <Counter to={s.to} suffix={s.s} />
              </p>
              <p className="label mt-3 text-zinc-500">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <p className="label mb-8 text-center text-zinc-600">Trusted by ambitious teams worldwide</p>
        <div className="animate-marquee flex w-max gap-16 pr-16 hover:[animation-play-state:paused]">
          {[...clients, ...clients].map((c, i) => (
            <span key={i} className="whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-zinc-700 transition-colors duration-300 hover:text-bone sm:text-3xl">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
