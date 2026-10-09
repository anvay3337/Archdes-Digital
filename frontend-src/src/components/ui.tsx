import { useEffect, useRef, useState, type ReactNode, type MouseEvent, type RefObject } from "react";
import { cn } from "../utils/cn";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ElementType = any;

export function useInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/** Calls cb with progress (0 → 1) as the element scrolls through the viewport. */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  cb: (p: number) => void,
  mode: "through" | "pinned" = "through"
) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "pinned") {
        const total = r.height - vh;
        p = total > 0 ? -r.top / total : 0;
      } else {
        p = (vh - r.top) / (vh + r.height);
      }
      cbRef.current(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, mode]);
}

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag ref={ref} className={cn("reveal", inView && "in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Splits heading into masked lines that slide up when in view. */
export function LineReveal({
  lines,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 90,
}: {
  lines: ReactNode[];
  className?: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
}) {
  const { ref, inView } = useInView<HTMLHeadingElement>(0.2);
  return (
    <Tag ref={ref} className={cn(inView && "in", className)}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask">
          <span style={{ transitionDelay: `${delay + i * stagger}ms` }}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function SectionLabel({ n, children, className }: { n: string; children: ReactNode; className?: string }) {
  return (
    <Reveal className={cn("flex items-center gap-3 text-zinc-400", className)}>
      <span className="label text-zinc-500">({n})</span>
      <span className="h-px w-10 bg-zinc-700" />
      <span className="label">{children}</span>
    </Reveal>
  );
}

export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", className)}
    >
      {children}
    </div>
  );
}

export function Serif({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-serif font-normal italic", className)}>{children}</span>;
}
