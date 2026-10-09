import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Works from "./components/Works";
import { Kinetic } from "./components/Studio";
import { Services } from "./components/Services";
import { Contact, FAQ, Footer } from "./components/Convert";
import { Cursor, ScrollProgress, SmoothScroll } from "./components/Experience";
import SpiralVortex from "./components/SpiralVortex";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onEnter = () => {
      setReady(true);
      window.__lenis?.start();
      window.scrollTo(0, 0);
    };

    // Attach to global window hooks
    const prevEnterSite = (window as any).enterSite;
    (window as any).enterSite = () => {
      onEnter();
      if (typeof prevEnterSite === "function") {
        try {
          prevEnterSite();
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener("archdes:enter-site", onEnter);

    // Only set ready if intro element is marked as out
    const introEl = document.getElementById("intro");
    if (introEl && introEl.classList.contains("out")) {
      setReady(true);
    }

    return () => {
      window.removeEventListener("archdes:enter-site", onEnter);
    };
  }, []);

  return (
    <div id="site" className="noise relative min-h-screen overflow-x-clip bg-[#06070b] text-[#f1f5f9]">
      <SmoothScroll />
      <Cursor />
      <ScrollProgress />
      <SpiralVortex />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      <Navbar ready={ready} />

      <main id="main" className="relative z-10 w-full">
        {/* First Section: 3D Hero */}
        <Hero ready={ready} />

        {/* 1. Works */}
        <Works />

        {/* Kinetic Marquee Section */}
        <Kinetic />

        {/* 4. Services */}
        <Services />

        {/* 8. FAQs */}
        <FAQ />

        {/* 9. Contact */}
        <Contact />
      </main>

      {/* Ends with ARCHDES Footer */}
      <Footer />
    </div>
  );
}

