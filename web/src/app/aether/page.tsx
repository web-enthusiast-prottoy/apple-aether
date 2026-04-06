"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./aether.css";
import AetherHeroNoShadow from "@/components/aether/AetherHeroNoShadow";
import AetherHighlights from "@/components/aether/AetherHighlights";
import AetherCloserLook from "@/components/aether/AetherCloserLook";
import Aether3DConfigurator from "@/components/aether/Aether3DConfigurator";
import AetherLoader from "@/components/aether/AetherLoader";
import AetherIphoneDrive from "@/components/aether/AetherIphoneDrive";

/* ─── DATA ─────────────────────────────────────────── */
const NAV_ITEMS = ["Overview", "Design", "Performance"];

const STATS = [
  { value: 2.1, unit: "s", label: "0–100 km/h" },
  { value: 720, unit: "km", label: "Estimated Range" },
  { value: 900, unit: "hp", label: "Peak Power" },
  { value: 15, unit: "min", label: "0–80% Charge" },
];

/* ─── HOOKS ─────────────────────────────────────────── */
function useCountUp(target: number, trigger: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(target % 1 !== 0 ? 1 : 0)));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [trigger, target, duration]);
  return count;
}

function useInView(ref: React.RefObject<Element | null>, threshold = 0.2) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

/* ─── STAT ITEM ─────────────────────────────────────── */
function StatItem({ value, unit, label, trigger }: { value: number; unit: string; label: string; trigger: boolean }) {
  const count = useCountUp(value, trigger);
  return (
    <div className="aether-stat">
      <span className="aether-stat-number">
        {count}{unit}
      </span>
      <span className="aether-stat-label">{label}</span>
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────── */
export default function AetherPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriggeredPerf, setHasTriggeredPerf] = useState(false);

  const perfRef = useRef<HTMLElement>(null);

  // GSAP Animations
  useEffect(() => {
    let ctx: any;
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Performance Section Animations
        const perfTl = gsap.timeline({
          scrollTrigger: {
            trigger: perfRef.current,
            start: "top 70%",
            onEnter: () => setHasTriggeredPerf(true),
          }
        });

        perfTl
          .from(".aether-perf-eyebrow", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
          })
          .from(".aether-perf-title-line", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power4.out"
          }, "-=0.6")
          .from(".aether-stat", {
            y: 60,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
          }, "-=0.7");
      }, perfRef);
    };

    if (!isLoading) {
      initGSAP();
      // Global refresh after a small delay to handle layout shifts
      setTimeout(() => {
        import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          ScrollTrigger.refresh();
        });
      }, 100);
    }

    return () => ctx && ctx.revert();
  }, [isLoading]);

  // Nav scroll tracking
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);



  return (
    <div className="aether-root" id="overview">
      {/* ── LOADER ── */}
      {isLoading && <AetherLoader onComplete={() => setIsLoading(false)} />}

      {/* ── NAV ── */}
      <nav className={`aether-nav ${scrolled ? "aether-nav--scrolled" : ""}`}>
        <div className="aether-nav-inner">
          <a href="#" className="aether-logo">
            <svg width="20" height="20" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 268.7-317.3 70.6 0 129.5 45.1 173.3 45.1 41.8 0 112.9-48.3 190.1-48.3 30.5 0 108.2 2.6 168.3 80.2zm-234.3-126.3c27.8-30.5 48.3-69.4 48.3-108.2 0-5.8-.6-11.6-1.3-16.8-47.1 1.9-103 31.8-136.8 63.5-27.8 27.2-51.5 66.1-51.5 105.6 0 6.4.6 12.9 1.3 18 4.5.6 10.3.7 15.3.7 42.8 0 96.9-20.7 124.7-62.8z" />
            </svg>
            <span>Aether</span>
          </a>

          <ul className={`aether-nav-links ${menuOpen ? "aether-nav-links--open" : ""}`}>
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>
              </li>
            ))}
          </ul>

          <div className="aether-nav-actions">
            <a href="#order" className="aether-btn aether-btn--pill">Pre-order</a>
            <button
              className="aether-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO — GSAP Frame Sequence ── */}
      <AetherHeroNoShadow isParentLoading={isLoading} />

      {/* ── HIGHLIGHTS SLIDER ── */}
      <AetherHighlights />

      {/* ── TAKE A CLOSER LOOK ── */}
      <AetherCloserLook />

      {/* ── DESIGN SHOWCASE (3D Configurator) ── */}
      <Aether3DConfigurator />

      {/* ── PERFORMANCE ── */}
      <section className="aether-performance" id="performance" ref={perfRef as React.RefObject<HTMLElement>}>
        <div className="aether-perf-bg">
          <div className="aether-speed-lines">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aether-speed-line" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="aether-perf-component">
                <h2 className="heading-style-h2 aether-section-title aether-section-title--light">
                  <span className="display-block aether-perf-title-line">Nothing else,</span>
                  <span className="display-block aether-perf-title-line">comes close.</span>
                </h2>
                <div className="aether-stats-grid">
                  {STATS.map((s) => (
                    <StatItem key={s.label} {...s} trigger={hasTriggeredPerf} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IPHONE DRIVE VISUALIZATION ── */}
      <section className="aether-iphone-drive" id="drive-sync">
        <AetherIphoneDrive />
      </section>

      {/* ── FOOTER ── */}
      <footer className="aether-footer">
        <div className="padding-global">
          <div className="container-large">
            <div className="aether-footer-inner">
              <div className="aether-footer-brand">
                <div className="aether-logo">
                  <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 268.7-317.3 70.6 0 129.5 45.1 173.3 45.1 41.8 0 112.9-48.3 190.1-48.3 30.5 0 108.2 2.6 168.3 80.2zm-234.3-126.3c27.8-30.5 48.3-69.4 48.3-108.2 0-5.8-.6-11.6-1.3-16.8-47.1 1.9-103 31.8-136.8 63.5-27.8 27.2-51.5 66.1-51.5 105.6 0 6.4.6 12.9 1.3 18 4.5.6 10.3.7 15.3.7 42.8 0 96.9-20.7 124.7-62.8z" />
                  </svg>
                  <span>Aether</span>
                </div>
                <p className="aether-footer-tagline">Pure electric. Pure intelligence.</p>
                <form className="aether-footer-subscribe">
                  <input type="email" placeholder="your@email.com" className="aether-footer-input" />
                  <button type="submit" className="aether-btn aether-btn--sm">Notify me</button>
                </form>
              </div>
              <div className="aether-footer-links">
                <div>
                  <h4>Vehicle</h4>
                  <ul>
                    <li><a href="#">Overview</a></li>
                    <li><a href="#">Design</a></li>
                    <li><a href="#">Performance</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Company</h4>
                  <ul>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Press</a></li>
                    <li><a href="#">Investors</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Support</h4>
                  <ul>
                    <li><a href="#">Order Status</a></li>
                    <li><a href="#">Delivery</a></li>
                    <li><a href="#">Service</a></li>
                    <li><a href="#">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="aether-footer-legal">
              <p>© 2025 Apple Inc. All rights reserved. Apple Aether is a concept product. Range estimates based on EPA testing methodology. Actual range varies.</p>
              <div className="aether-footer-legal-links">
                <a href="#">Privacy</a>
                <a href="#">Terms of Use</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
