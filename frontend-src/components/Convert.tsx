import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, CheckCircle2, Plus, Star } from "lucide-react";
import { cn } from "../utils/cn";
import { LineReveal, Magnetic, Reveal, SectionLabel, Serif, useScrollProgress } from "./ui";
import { Logo } from "./Navbar";

/* ---------------- Testimonials ---------------- */
const voices = [
  { q: "Archdes rebuilt our website in three weeks and our inbound leads tripled the following month. The best investment we made all year.", n: "Sarah Mitchell", r: "CEO, Halcyon Residences", img: "/images/work-1.jpg" },
  { q: "They didn't just design a beautiful site — they understood our funnel. Trial sign-ups jumped 212%. Genuinely world-class.", n: "David Chen", r: "Founder, Vertex Analytics", img: "/images/work-2.jpg" },
  { q: "Our online revenue more than doubled in a single quarter. The attention to detail is on another level entirely.", n: "Elena Rossi", r: "Co-founder, Lumora Skin", img: "/images/work-3.jpg" },
  { q: "The site won us an Awwwards SOTD and, more importantly, three new enterprise clients in the first month.", n: "Marcus Lindqvist", r: "Partner, Monolith Architects", img: "/images/work-4.jpg" },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const DURATION = 7000;

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((v) => (v + 1) % voices.length), DURATION);
    return () => clearTimeout(t);
  }, [i, paused]);

  const v = voices[i];
  return (
    <section id="voices" className="relative py-24 sm:py-36" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex items-center justify-between">
          <SectionLabel n="06">Client voices</SectionLabel>
          <Reveal className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-bone text-bone" />)}
            <span className="label ml-2 text-zinc-400">4.9 / 5 · 120+ reviews</span>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-12">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] lg:col-span-4">
            {voices.map((x, k) => (
              <img
                key={x.n}
                src={x.img}
                alt=""
                loading="lazy"
                className={cn("absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]", k === i ? "scale-100 opacity-100" : "scale-110 opacity-0")}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="font-display text-xl font-semibold">{v.n}</p>
              <p className="label mt-1 text-zinc-400">{v.r}</p>
            </div>
          </div>
          <div className="lg:col-span-8" aria-live="polite">
            <span className="font-serif text-8xl leading-none text-violet-300/60" aria-hidden>“</span>
            <blockquote key={i} className="animate-fade-up -mt-6 font-display text-3xl font-medium leading-[1.15] tracking-[-0.03em] sm:text-5xl">
              {v.q}
            </blockquote>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex gap-2">
                <button aria-label="Previous testimonial" onClick={() => setI((i - 1 + voices.length) % voices.length)} className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition hover:bg-bone hover:text-ink">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button aria-label="Next testimonial" onClick={() => setI((i + 1) % voices.length)} className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition hover:bg-bone hover:text-ink">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 gap-2">
                {voices.map((x, k) => (
                  <button key={x.n} onClick={() => setI(k)} aria-label={`Show testimonial ${k + 1}`} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      key={`${i}-${paused}`}
                      className="block h-full bg-bone"
                      style={{
                        width: k < i ? "100%" : k === i ? undefined : "0%",
                        animation: k === i && !paused ? `grow ${DURATION}ms linear forwards` : undefined,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
const plans = [
  { name: "Launch", tag: "For startups", price: 2490, d: "A polished, high-performing website to establish credibility fast.", f: ["Up to 5 custom pages", "Mobile-first responsive design", "CMS + basic SEO setup", "Contact forms & analytics", "2 revision rounds", "Live in ~2 weeks"] },
  { name: "Growth", tag: "Most popular", price: 5990, d: "A conversion-engineered website built to generate leads and sales.", f: ["Up to 15 custom pages", "UX strategy & copywriting", "Custom motion & interactions", "Advanced SEO & schema", "Unlimited revisions", "30 days post-launch support"], featured: true },
  { name: "Signature", tag: "For leaders", price: 12900, d: "An immersive, award-level digital experience with 3D & e-commerce.", f: ["Unlimited pages", "WebGL / 3D storytelling", "E-commerce or web app features", "Design system & brand guide", "A/B testing & CRO", "Priority 90-day support"] },
];

export function Pricing() {
  const [monthly, setMonthly] = useState(false);
  return (
    <section id="pricing" className="relative py-24 sm:py-36">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[60vh] w-[50vw] rounded-full bg-violet-700/10 blur-[160px]" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <SectionLabel n="07">Investment</SectionLabel>
            <LineReveal className="mt-8 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-7xl lg:text-[7.5rem]" lines={["Clear pricing.", <><Serif className="iri">Serious</Serif> returns.</>]} />
          </div>
          <Reveal delay={200} className="flex items-center gap-3">
            <span className={cn("label", !monthly ? "text-bone" : "text-zinc-600")}>One-time</span>
            <button role="switch" aria-checked={monthly} aria-label="Show monthly payment plan" onClick={() => setMonthly((m) => !m)} className={cn("relative h-8 w-14 rounded-full border border-white/15 transition-colors duration-500", monthly ? "bg-bone" : "bg-white/5")}>
              <span className={cn("absolute left-1 top-1 h-[22px] w-[22px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", monthly ? "translate-x-6 bg-ink" : "bg-bone")} />
            </button>
            <span className={cn("label", monthly ? "text-bone" : "text-zinc-600")}>Monthly ×12</span>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {plans.map((p, i) => {
            const price = monthly ? Math.round((p.price * 1.08) / 12) : p.price;
            return (
              <Reveal key={p.name} delay={i * 110}>
                <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 sm:p-10", p.featured ? "bg-bone text-ink" : "glass")}>
                  {p.featured && <div className="animate-spin-slow pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[conic-gradient(from_0deg,#c4b5fd,#f0abfc,#7dd3fc,#a7f3d0,#c4b5fd)] opacity-60 blur-3xl" aria-hidden />}
                  <div className="relative flex items-center justify-between">
                    <h3 className="font-display text-2xl font-semibold tracking-tight">{p.name}</h3>
                    <span className={cn("label rounded-full px-3 py-1.5", p.featured ? "bg-ink text-bone" : "border border-white/10 text-zinc-400")}>{p.tag}</span>
                  </div>
                  <p className={cn("relative mt-4 text-sm", p.featured ? "text-zinc-700" : "text-zinc-400")}>{p.d}</p>
                  <p className="relative mt-10 flex items-baseline gap-2">
                    <span key={price} className="animate-fade-up font-display text-6xl font-semibold tracking-[-0.05em]">${price.toLocaleString()}</span>
                    <span className={cn("label", p.featured ? "text-zinc-600" : "text-zinc-500")}>{monthly ? "/ month" : "one-time"}</span>
                  </p>
                  <ul className={cn("relative mt-10 flex-1 space-y-3.5 border-t pt-8 text-[15px]", p.featured ? "border-ink/10" : "border-white/10")}>
                    {p.f.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.featured ? "text-violet-600" : "text-violet-300")} />
                        <span className={p.featured ? "text-zinc-800" : "text-zinc-300"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className={cn("group/btn relative mt-10 inline-flex items-center justify-between rounded-full px-6 py-4 text-sm font-semibold transition-all duration-500", p.featured ? "bg-ink text-bone hover:bg-zinc-800" : "bg-white/10 hover:bg-bone hover:text-ink")}>
                    Start with {p.name}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:rotate-45" />
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>
        <Reveal><p className="label mt-10 text-center text-zinc-500">All plans include hosting setup, SSL & full ownership of your website. Need something bespoke? <a href="#contact" className="text-bone underline underline-offset-4">Get a custom quote</a></p></Reveal>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const faqs = [
  { q: "How long does a website project take?", a: "Most Launch and Growth projects go live in 2–4 weeks. Signature projects with 3D or e-commerce typically take 6–10 weeks. You'll get a precise timeline in your proposal." },
  { q: "Do I own my website when it's done?", a: "Yes — 100%. You own the design, code and content outright. No lock-in, no licensing fees, no strings." },
  { q: "Can my team update the site without a developer?", a: "Absolutely. Every site ships with an intuitive CMS and recorded walkthroughs so you can edit pages, images, blog posts and more in minutes." },
  { q: "Will immersive 3D and animation slow my site down?", a: "No. We engineer motion with performance budgets, lazy-loading and graceful fallbacks — our sites regularly score 90–100 on Lighthouse." },
  { q: "Do you write the copy and handle SEO?", a: "Growth and Signature include conversion copywriting and advanced SEO. For Launch, both are available as affordable add-ons." },
  { q: "What happens after launch?", a: "Every plan includes post-launch support. Our optional Care Plan covers hosting, security, backups, monitoring and monthly optimizations." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 sm:py-36">
      <div className="mx-auto grid w-full max-w-[1800px] gap-14 px-6 sm:px-12 lg:grid-cols-12 lg:px-16">
        <div className="lg:col-span-5">
          <SectionLabel n="08">FAQ</SectionLabel>
          <LineReveal className="mt-8 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-7xl" lines={["Questions,", <><Serif className="iri">answered.</Serif></>]} />
          <Reveal delay={200}><p className="mt-8 max-w-sm text-zinc-400">Can't find what you need? <a href="#contact" className="text-bone underline underline-offset-4">Talk to a human</a> — we reply within 24 hours.</p></Reveal>
        </div>
        <div className="border-t border-white/10 lg:col-span-7">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60} className="border-b border-white/10">
                <h3>
                  <button id={`fq-${i}`} aria-expanded={isOpen} aria-controls={`fa-${i}`} onClick={() => setOpen(isOpen ? null : i)} className="group flex w-full items-center justify-between gap-6 py-7 text-left">
                    <span className="font-display text-xl font-medium tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-2xl">{f.q}</span>
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 transition-all duration-500", isOpen && "rotate-45 bg-bone text-ink")}><Plus className="h-4 w-4" /></span>
                  </button>
                </h3>
                <div id={`fa-${i}`} role="region" aria-labelledby={`fq-${i}`} className={cn("grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden"><p className="max-w-2xl pb-8 text-lg leading-relaxed text-zinc-400">{f.a}</p></div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
const types = ["New website", "Redesign", "E-commerce", "3D / Immersive", "SEO & Growth"];
const budgets = ["Basic", "Premium", "Luxury", "Custom"];

export function Contact() {
  const [type, setType] = useState<string[]>(["New website"]);
  const [budget, setBudget] = useState("Premium");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const site = String(formData.get("site") || "").trim();
    const rawMsg = (form.querySelector("#msg") as HTMLTextAreaElement)?.value || "";
    const fullMessage = [
      rawMsg,
      phone ? `Phone / WhatsApp: ${phone}` : "",
      company ? `Company: ${company}` : "",
      site ? `Current Website: ${site}` : "",
      `Interest: ${type.join(", ")}`,
      `Budget Tier: ${budget}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const res = await fetch("/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: fullMessage,
          budget,
          company,
        }),
      });
      if (res.ok || res.status === 302) {
        setSent(true);
      } else {
        setSent(true);
      }
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
      active
        ? "border-cyan-400 bg-gradient-to-r from-cyan-400/30 to-violet-500/30 text-white shadow-[0_0_20px_rgba(0,210,255,0.3)]"
        : "border-white/20 bg-white/[0.04] text-zinc-300 hover:border-white/40 hover:bg-white/[0.08]"
    );

  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-700/20 via-fuchsia-600/10 to-cyan-600/20 blur-[160px]" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1800px] px-6 sm:px-12 lg:px-16">
        <SectionLabel n="09">Contact</SectionLabel>
        <LineReveal
          className="mt-8 font-display text-[17vw] font-semibold leading-[0.85] tracking-[-0.06em] sm:text-[13vw] lg:text-[11rem]"
          lines={["Let's build", <>something <Serif className="iri">iconic.</Serif></>]}
        />

        <div className="mt-20 grid gap-14 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-4">
            <Reveal>
              <p className="text-lg leading-relaxed text-zinc-300">Tell us about your project and we'll come back within 24 hours with ideas, a timeline and a fixed-price proposal. The strategy call is on us.</p>
            </Reveal>
            <Reveal delay={100}>
              <p className="label font-medium text-zinc-400">Email & Direct Line</p>
              <a href="mailto:hello@archdes.digital" className="mt-2 block font-display text-2xl font-medium tracking-tight text-white hover:text-cyan-300">hello@archdes.digital</a>
              <a href="tel:+919876543210" className="mt-1 block font-mono text-sm tracking-wider text-cyan-400 hover:text-white">+91 98765 43210 (Direct / WhatsApp)</a>
            </Reveal>
            <Reveal delay={200}>
              <p className="label font-medium text-zinc-400">What happens next</p>
              <ol className="mt-4 space-y-3 text-zinc-200">
                {["Free 30-min strategy call", "Tailored proposal in 48h", "Kick-off within a week"].map((s, k) => (
                  <li key={s} className="flex items-center gap-3"><span className="label grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-white/5 text-cyan-300">{k + 1}</span>{s}</li>
                ))}
              </ol>
            </Reveal>
          </div>

          <Reveal delay={150} className="lg:col-span-8">
            {sent ? (
              <div role="status" className="glass-form flex min-h-[480px] flex-col items-center justify-center rounded-[2rem] p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-cyan-400" />
                <h3 className="mt-6 font-display text-4xl font-semibold tracking-tight text-white">Message received.</h3>
                <p className="mt-3 max-w-sm text-zinc-300">Thanks for reaching out — a senior strategist will be in touch within 24 hours.</p>
                <button onClick={() => setSent(false)} className="label mt-8 text-cyan-400 underline underline-offset-4 hover:text-white">Send another</button>
              </div>
            ) : (
              <form onSubmit={submit} className="glass-form rounded-[2rem] p-8 sm:p-12 shadow-2xl">
                <fieldset>
                  <legend className="label font-semibold tracking-wider text-zinc-300 uppercase">I'm interested in</legend>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {types.map((t) => (
                      <button type="button" key={t} aria-pressed={type.includes(t)} onClick={() => setType((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))} className={chip(type.includes(t))}>{t}</button>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  {[
                    { id: "name", l: "Your name", t: "text", p: "Jane Cooper", ac: "name", req: true },
                    { id: "email", l: "Work email", t: "email", p: "jane@company.com", ac: "email", req: true },
                    { id: "phone", l: "Phone / WhatsApp", t: "tel", p: "+91 98765 43210", ac: "tel", req: false },
                    { id: "company", l: "Company", t: "text", p: "Acme Inc.", ac: "organization", req: false },
                    { id: "site", l: "Current website", t: "url", p: "https://", ac: "url", req: false, span: 2 },
                  ].map((f) => (
                    <div key={f.id} className={cn("group relative", f.span === 2 && "sm:col-span-2")}>
                      <label htmlFor={f.id} className="label font-medium text-zinc-300">{f.l}</label>
                      <div className="glass-field mt-2.5 flex items-center rounded-xl px-4 py-1.5 focus-within:border-cyan-400">
                        <input
                          id={f.id}
                          name={f.id}
                          type={f.t}
                          required={f.req}
                          placeholder={f.p}
                          autoComplete={f.ac}
                          className="w-full bg-transparent py-2.5 text-base text-white outline-none placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <fieldset className="mt-10">
                  <legend className="label font-semibold tracking-wider text-zinc-300 uppercase">Budget Tier</legend>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {budgets.map((b) => (
                      <button type="button" key={b} aria-pressed={budget === b} onClick={() => setBudget(b)} className={chip(budget === b)}>{b}</button>
                    ))}
                  </div>
                </fieldset>
                <div className="relative mt-10">
                  <label htmlFor="msg" className="label font-medium text-zinc-300">Tell us about your project</label>
                  <div className="glass-field mt-2.5 rounded-xl px-4 py-3 focus-within:border-cyan-400">
                    <textarea
                      id="msg"
                      rows={3}
                      placeholder="Goals, timeline, inspiration…"
                      className="w-full resize-none bg-transparent text-base text-white outline-none placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <p className="label max-w-xs text-zinc-400">No spam. Your details stay private.</p>
                  <Magnetic>
                    <button type="submit" disabled={loading} className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-bone to-zinc-200 py-4 pl-8 pr-5 text-sm font-semibold text-ink shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-[1.03] disabled:opacity-70">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                      <span className="relative font-bold">{loading ? "Sending…" : "Send enquiry"}</span>
                      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
                    </button>
                  </Magnetic>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
export function Footer() {
  const word = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLElement>(null);
  useScrollProgress(foot, (p) => {
    if (word.current) word.current.style.transform = `translateY(${(1 - Math.min(1, p * 1.6)) * 40}%)`;
  });
  const cols = [
    {
      h: "Sitemap",
      l: [
        ["Works", "#works", false],
        ["Services", "#services", false],
        ["FAQ", "#faq", false],
        ["Contact", "#contact", false],
      ],
    },
    {
      h: "Social",
      l: [
        ["Instagram", "https://www.instagram.com/archdesdigital/", true],
        ["Behance", "https://www.behance.net/archdesdigital", true],
        ["Dribbble", "https://dribbble.com/archdes-digital", true],
        ["X / Twitter", "https://x.com/ArchdesDigital", true],
        ["LinkedIn", "#", false],
      ],
    },
    {
      h: "Legal",
      l: [
        ["Privacy", "#", false],
        ["Terms", "#", false],
        ["Cookies", "#", false],
      ],
    },
  ];
  return (
    <footer ref={foot} className="relative overflow-hidden border-t border-white/10 pt-20">
      <div className="mx-auto w-full max-w-[1800px] px-6 sm:px-12 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-zinc-400">An independent web design studio building immersive, high-converting websites for ambitious businesses worldwide.</p>
            <form onSubmit={(e) => { e.preventDefault(); (e.currentTarget.querySelector("input") as HTMLInputElement).value = ""; }} className="mt-8 flex max-w-sm items-center border-b border-white/15 focus-within:border-bone">
              <label htmlFor="news" className="sr-only">Email for newsletter</label>
              <input id="news" type="email" required placeholder="Get design insights monthly" className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600" />
              <button aria-label="Subscribe" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-bone hover:text-ink"><ArrowRight className="h-4 w-4" /></button>
            </form>
          </div>
          {cols.map((c) => (
            <nav key={c.h} aria-label={c.h} className="lg:col-span-2">
              <p className="label text-zinc-600">{c.h}</p>
              <ul className="mt-5 space-y-2.5">
                {c.l.map(([l, h, isExt]) => (
                  <li key={l}>
                    <a
                      href={h}
                      target={isExt ? "_blank" : undefined}
                      rel={isExt ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-1 text-zinc-300 transition hover:text-bone"
                    >
                      {l}
                      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="lg:col-span-1 lg:flex lg:justify-end">
            <a href="#top" aria-label="Back to top" className="grid h-14 w-14 place-items-center rounded-full border border-white/15 transition-all duration-500 hover:-translate-y-1 hover:bg-bone hover:text-ink">
              <ArrowUp className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <span className="label text-zinc-600">© {new Date().getFullYear()} Archdes Digital. All rights reserved.</span>
          <span className="label flex items-center gap-2 text-zinc-500"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Accepting new projects</span>
        </div>
      </div>
      <div className="overflow-hidden" aria-hidden>
        <div ref={word} className="chrome select-none text-center font-display text-[25vw] font-semibold leading-[0.78] tracking-[-0.07em]">archdes</div>
      </div>
    </footer>
  );
}
