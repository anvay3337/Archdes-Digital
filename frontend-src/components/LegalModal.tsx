import { useEffect, useRef, useState } from "react";
import { X, ShieldCheck, FileText, Cookie, Check, Sparkles } from "lucide-react";
import { cn } from "../utils/cn";
import { CONTACT_CONFIG } from "../config/contact";

export type LegalDocType = "privacy" | "terms" | "cookies";

interface LegalModalProps {
  isOpen: boolean;
  initialDoc: LegalDocType;
  onClose: () => void;
}

export function LegalModal({ isOpen, initialDoc, onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);
  const [cookieSettings, setCookieSettings] = useState({
    performance: true,
    analytics: true,
  });
  const [cookieSaved, setCookieSaved] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Sync active tab with prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialDoc);
      setCookieSaved(false);
    }
  }, [isOpen, initialDoc]);

  // Reset scroll to top when tab changes
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Load saved preferences if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("archdes_cookie_prefs");
      if (saved) {
        setCookieSettings(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Handle ESC key and scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    // Stop Lenis and lock body
    if (typeof window !== "undefined") {
      (window as any).__lenis?.stop();
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (typeof window !== "undefined") {
        (window as any).__lenis?.start();
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveCookies = () => {
    try {
      localStorage.setItem("archdes_cookie_prefs", JSON.stringify(cookieSettings));
      setCookieSaved(true);
      setTimeout(() => setCookieSaved(false), 3000);
    } catch {
      // ignore
    }
  };

  const tabs: { id: LegalDocType; label: string; icon: typeof ShieldCheck }[] = [
    { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
    { id: "terms", label: "Terms of Service", icon: FileText },
    { id: "cookies", label: "Cookie Policy", icon: Cookie },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div
        data-lenis-prevent
        className="relative z-10 flex h-[85vh] max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl sm:rounded-3xl border border-white/15 bg-[#090a10]/95 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 flex-col gap-4 border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-bone">
                {activeTab === "privacy" && <ShieldCheck className="h-5 w-5 text-indigo-400" />}
                {activeTab === "terms" && <FileText className="h-5 w-5 text-sky-400" />}
                {activeTab === "cookies" && <Cookie className="h-5 w-5 text-amber-400" />}
              </span>
              <div>
                <h2 id="legal-modal-title" className="font-display text-lg font-semibold sm:text-xl text-white">
                  {activeTab === "privacy" && "Privacy Policy"}
                  {activeTab === "terms" && "Terms of Service"}
                  {activeTab === "cookies" && "Cookie Policy"}
                </h2>
                <p className="text-xs text-zinc-400">Archdes Digital Studio · Last updated: 2026</p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition sm:text-sm",
                    isActive
                      ? "bg-bone text-ink shadow-sm"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={bodyRef}
          data-lenis-prevent
          tabIndex={0}
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scrollbar px-6 py-6 sm:px-8 sm:py-8 text-sm leading-relaxed text-zinc-200 space-y-6 focus:outline-none"
        >
          {/* ================= PRIVACY POLICY ================= */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs sm:text-sm text-indigo-200">
                Archdes Digital respects your confidentiality. We do not sell, rent, or monetize your personal information or design intellectual property under any circumstances.
              </div>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">1. Information We Collect</h3>
                <p>When you interact with Archdes Digital through our project discovery forms, newsletter, or direct inquiries, we may collect:</p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li><strong className="text-zinc-200">Contact Details:</strong> Your name, company name, corporate email address, and phone or WhatsApp number.</li>
                  <li><strong className="text-zinc-200">Project Brief & Details:</strong> Scope requirements, target launch dates, estimated budget tiers, and design assets shared with us.</li>
                  <li><strong className="text-zinc-200">Technical Diagnostics:</strong> Browser type, viewport dimensions, device hardware capabilities (to ensure high-fidelity WebGL / 3D rendering), and anonymous performance metrics.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">2. How We Use Your Information</h3>
                <p>Your details are utilized strictly for professional studio engagement:</p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Preparing customized design estimates, creative roadmaps, and Statements of Work (SOW).</li>
                  <li>Direct client communication during sprint milestones and design reviews.</li>
                  <li>Delivering our monthly design publication if you explicitly opted into newsletter insights.</li>
                  <li>Troubleshooting site performance and optimizing 3D canvas rendering across devices.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">3. Non-Disclosure & Confidentiality</h3>
                <p>
                  We frequently collaborate with early-stage startups and enterprises with proprietary technology. All unreleased product features, brand concepts, and strategy briefs shared with Archdes Digital are protected under mutual confidentiality and standard non-disclosure practices.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">4. Data Security & Storage</h3>
                <p>
                  Form submissions and communications are transmitted via modern TLS 1.3 encryption. We implement strict access controls and do not store sensitive payment card details on our local servers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">5. Your Privacy Rights</h3>
                <p>
                  You hold full rights under applicable data protection frameworks to request an export of data we hold about you or request its total erasure from our records. Inquire directly at{" "}
                  <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-bone underline underline-offset-4 hover:text-white">
                    {CONTACT_CONFIG.email}
                  </a>.
                </p>
              </section>
            </div>
          )}

          {/* ================= TERMS OF SERVICE ================= */}
          {activeTab === "terms" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs sm:text-sm text-sky-200">
                These terms govern your visit to our website and define the general framework for engaging Archdes Digital studio services.
              </div>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">1. Studio Engagements & Scope</h3>
                <p>
                  Archdes Digital provides creative design, 3D web experience development, brand positioning, and digital design systems. All paid client projects are governed by a formal Statement of Work (SOW) or proposal outlining agreed deliverables, timeline, milestones, and budget.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">2. Intellectual Property Rights</h3>
                <p>
                  Upon full settlement of all milestone invoices, all bespoke source code, finalized Figma UI kits, 3D assets, and design deliverables created exclusively for the client transfer to the client.
                </p>
                <p className="text-zinc-400">
                  Archdes Digital reserves the customary right to display non-confidential project case studies, screenshots, and visual highlights in our portfolio, awards submissions, and social channels, unless an exclusive NDA specifies otherwise.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">3. Client Responsibilities</h3>
                <p>
                  Clients agree to provide brand collateral, copy, necessary third-party API credentials, and timely milestone feedback to ensure sprints proceed according to the designated schedule.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">4. Payment Schedules & Milestones</h3>
                <p>
                  Standard engagements follow a milestone structure (e.g., initial deposit before discovery kick-off, intermediate milestone, and final balance prior to production hand-off or domain cutover). Invoices are payable within the agreed terms specified in your project agreement.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">5. Revisions & Satisfaction</h3>
                <p>
                  Every phase includes structured revision loops clearly defined in the project scope. Additional revision rounds or changes out of initial scope are provided on an hourly or sprint-add-on basis.
                </p>
              </section>
            </div>
          )}

          {/* ================= COOKIE POLICY ================= */}
          {activeTab === "cookies" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs sm:text-sm text-amber-200">
                We use cookies and local storage to provide fluid animations, 3D hardware optimization, and analyze site engagement.
              </div>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">1. What Are Cookies?</h3>
                <p>
                  Cookies are tiny text files saved to your computer or mobile device when you browse websites. They help the application recognize your device, remember preferences, and ensure responsive user interfaces.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="font-display text-base font-semibold text-white">2. Cookie Categories & Preferences</h3>

                {/* Preference card: Essential */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Essential & System Cookies</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Required for smooth scrolling (Lenis), theme persistence, and security.</p>
                    </div>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-zinc-300">Always Active</span>
                  </div>
                </div>

                {/* Preference card: Performance */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">3D & WebGL Performance Cookies</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Caches device GPU capabilities to adapt particle density and frame rates.</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={cookieSettings.performance}
                        onChange={(e) => setCookieSettings((prev) => ({ ...prev, performance: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-bone peer-checked:after:translate-x-full peer-checked:after:bg-ink"></div>
                    </label>
                  </div>
                </div>

                {/* Preference card: Analytics */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Anonymous Usage Analytics</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Collects aggregate telemetry to understand which case studies are viewed.</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={cookieSettings.analytics}
                        onChange={(e) => setCookieSettings((prev) => ({ ...prev, analytics: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-bone peer-checked:after:translate-x-full peer-checked:after:bg-ink"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleSaveCookies}
                    className="inline-flex items-center gap-2 rounded-xl bg-bone px-4 py-2 text-xs font-semibold text-ink transition hover:bg-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save Cookie Preferences
                  </button>
                  {cookieSaved && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in">
                      <Sparkles className="h-3.5 w-3.5" /> Preferences saved!
                    </span>
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-base font-semibold text-white">3. Browser Controls</h3>
                <p>
                  You can also manage or disable cookies completely through your browser settings (Chrome, Safari, Firefox, Edge). Note that disabling WebGL caches may slightly affect interactive 3D rendering responsiveness.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/10 bg-black/30 px-6 py-4 sm:px-8">
          <span className="text-xs text-zinc-500">
            Questions? Contact{" "}
            <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-zinc-300 hover:text-white underline">
              {CONTACT_CONFIG.email}
            </a>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
