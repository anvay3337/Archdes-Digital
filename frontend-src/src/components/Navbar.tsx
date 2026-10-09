import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../utils/cn";
import { Magnetic } from "./ui";

const links = [
  { label: "Works", href: "#works" },
  { label: "Services", href: "#services" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Logo({ className }: { className?: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && typeof (window as any).restartIntro === "function") {
      e.preventDefault();
      (window as any).restartIntro();
    }
  };

  return (
    <a
      href="#top"
      onClick={handleClick}
      className={cn("group flex items-center gap-3 cursor-pointer", className)}
      aria-label="Archdes Digital — home & replay intro"
    >
      <img
        src="/assets/archdes-logo.png"
        alt="Archdes Digital Logo"
        className="h-8 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
      />
      <span className="font-display text-[17px] font-bold tracking-wider text-white">ARCHDES DIGITAL</span>
    </a>
  );
}

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <span className="label tabular-nums text-zinc-400">
      {t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · Local
    </span>
  );
}

export default function Navbar({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 300);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else if (wasOpen.current) window.__lenis?.start();
    wasOpen.current = open;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
          ready ? "opacity-100" : "opacity-0"
        )}
      >
        <nav aria-label="Primary" className={cn("mx-auto flex w-full max-w-[1800px] items-center justify-between px-6 py-4 transition-all duration-500 sm:px-12 lg:px-16", scrolled && !open && "bg-ink/60 backdrop-blur-xl")}>
          <Logo />
          <div className="hidden md:block">
            <Clock />
          </div>
          <div className="flex items-center gap-2">
            <Magnetic className="hidden sm:inline-block">
              <a
                href="#contact"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition-colors duration-500 hover:text-ink"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                <span className="relative">Start a project</span>
                <ArrowUpRight className="relative h-4 w-4" />
              </a>
            </Magnetic>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="group flex h-10 items-center gap-3 rounded-full bg-bone pl-4 pr-3 text-sm font-medium text-ink"
            >
              <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
              <span className="relative block h-3 w-5">
                <span className={cn("absolute left-0 h-[1.5px] w-5 bg-ink transition-all duration-500", open ? "top-1.5 rotate-45" : "top-0.5")} />
                <span className={cn("absolute left-0 h-[1.5px] w-5 bg-ink transition-all duration-500", open ? "top-1.5 -rotate-45" : "top-2.5 w-3 group-hover:w-5")} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen menu */}
      <div
        id="site-menu"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-[55] flex flex-col bg-[#0b0b10] transition-[clip-path] duration-[1000ms] ease-[cubic-bezier(0.76,0,0.24,1)]",
          open ? "[clip-path:circle(150%_at_calc(100%-3rem)_2.5rem)]" : "pointer-events-none [clip-path:circle(0%_at_calc(100%-3rem)_2.5rem)]"
        )}
      >
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-24 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <ul className="space-y-1">
            {links.map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <a
                  href={l.href}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-baseline gap-4 font-display text-5xl font-semibold tracking-[-0.04em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-7xl lg:text-8xl",
                    open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                  )}
                  style={{ transitionDelay: open ? `${250 + i * 60}ms` : "0ms" }}
                >
                  <span className="label text-zinc-600">0{i + 1}</span>
                  <span className="relative text-zinc-500 transition-colors duration-500 group-hover:text-bone">
                    {l.label}
                    <span className="absolute -bottom-1 left-0 h-[3px] w-0 bg-gradient-to-r from-violet-400 to-cyan-300 transition-all duration-500 group-hover:w-full" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className={cn("mt-14 grid grid-cols-2 gap-8 transition-all duration-700 lg:mt-0 lg:grid-cols-1", open ? "opacity-100 delay-700" : "opacity-0")}>
            <div>
              <p className="label text-zinc-600">New business</p>
              <a tabIndex={open ? 0 : -1} href="mailto:hello@archdes.digital" className="mt-2 block text-lg hover:text-violet-300">hello@archdes.digital</a>
            </div>
            <div>
              <p className="label text-zinc-600">Follow</p>
              <div className="mt-2 flex flex-col gap-1 text-lg">
                {[
                  { n: "Instagram", u: "https://www.instagram.com/archdesdigital/" },
                  { n: "Behance", u: "https://www.behance.net/archdesdigital" },
                  { n: "Dribbble", u: "https://dribbble.com/archdes-digital" },
                  { n: "X / Twitter", u: "https://x.com/ArchdesDigital" },
                  { n: "LinkedIn", u: "#" },
                ].map((s) => (
                  <a
                    tabIndex={open ? 0 : -1}
                    key={s.n}
                    href={s.u}
                    target={s.u.startsWith("http") ? "_blank" : undefined}
                    rel={s.u.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="w-fit text-zinc-400 transition hover:text-bone"
                  >
                    {s.n} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl justify-between px-5 pb-6 sm:px-8">
          <span className="label text-zinc-600">© Archdes Digital</span>
          <span className="label text-zinc-600">Available for Q3 projects</span>
        </div>
      </div>
    </>
  );
}
