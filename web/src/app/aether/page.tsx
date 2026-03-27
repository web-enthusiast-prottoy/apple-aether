"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./aether.css";
import AetherHeroNoShadow from "@/components/aether/AetherHeroNoShadow";
import AetherHighlights from "@/components/aether/AetherHighlights";
import AetherCloserLook from "@/components/aether/AetherCloserLook";

/* ─── DATA ─────────────────────────────────────────── */
const NAV_ITEMS = ["Overview", "Design", "Performance", "Technology", "Safety", "Order"];

const STATS = [
  { value: 2.1, unit: "s", label: "0–100 km/h" },
  { value: 720, unit: "km", label: "Estimated Range" },
  { value: 900, unit: "hp", label: "Peak Power" },
  { value: 15, unit: "min", label: "0–80% Charge" },
];

const TECH_PANELS = [
  {
    tag: "Siri Intelligence",
    title: "Drive with your voice.",
    body:
      "Siri understands your journey before you do. Set destinations, control climate, play music, and navigate autonomously — all with natural language.",
    icon: "🎙",
  },
  {
    tag: "iPhone Sync",
    title: "Your phone. Your car.",
    body:
      "Step in and Aether syncs instantly. Your playlists, navigation, calendar, and calls — live in the dashboard the moment you sit down.",
    icon: "📱",
  },
  {
    tag: "Autonomous Mode",
    title: "Hands off. Mind free.",
    body:
      "Level 4 autonomy across all conditions. 32 sensors, 8 cameras, lidar and neural processing — all running Apple Silicon at the edge.",
    icon: "🧠",
  },
  {
    tag: "CarPlay Ultra",
    title: "The full OS. In the dash.",
    body:
      "Not just a mirror. CarPlay Ultra runs natively — apps, widgets, spatial audio, and Live Activities, spanning the entire dash display.",
    icon: "🖥",
  },
];

const PRICING = [
  {
    name: "Aether",
    price: "$79,900",
    range: "620 km",
    power: "500 hp",
    acceleration: "3.2s",
    color: "#F5F5F7",
    textColor: "#1D1D1F",
  },
  {
    name: "Aether Pro",
    price: "$109,900",
    range: "720 km",
    power: "700 hp",
    acceleration: "2.5s",
    color: "#1D1D1F",
    textColor: "#F5F5F7",
    featured: true,
  },
  {
    name: "Aether Max",
    price: "$139,900",
    range: "780 km",
    power: "900 hp",
    acceleration: "2.1s",
    color: "#0071E3",
    textColor: "#FFFFFF",
  },
];

const SUSTAINABILITY = [
  { icon: "♻️", title: "100% Recycled Aluminum", body: "Every body panel forged from post-industrial recycled aluminum alloy." },
  { icon: "☀️", title: "Solar Charging Ready", body: "Roof-integrated solar cells add 30 km of range daily in direct sunlight." },
  { icon: "🌱", title: "Carbon Negative Assembly", body: "Our factory runs entirely on renewable energy, carbon-negative since 2024." },
  { icon: "💧", title: "Waterless Manufacturing", body: "Zero water usage in paint and finishing through dry-process technology." },
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
  const [techIndex, setTechIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const perfRef = useRef<HTMLElement>(null);
  const perfInView = useInView(perfRef as React.RefObject<Element>);

  // Nav scroll tracking
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Tech horizontal scroll
  const techRef = useRef<HTMLDivElement>(null);
  const handleTechScroll = () => {
    if (!techRef.current) return;
    const { scrollLeft, offsetWidth } = techRef.current;
    setTechIndex(Math.round(scrollLeft / offsetWidth));
  };

  return (
    <div className="aether-root">
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
      <AetherHeroNoShadow />

      {/* ── HIGHLIGHTS SLIDER ── */}
      <AetherHighlights />

      {/* ── TAKE A CLOSER LOOK ── */}
      <AetherCloserLook />

      {/* ── DESIGN SHOWCASE ── */}
      <section className="aether-design" id="design">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="aether-design-component">
                <div className="aether-design-text">
                  <p className="aether-eyebrow">Industrial Design</p>
                  <h2 className="heading-style-h2 aether-section-title">Precision.<br />Materialized.</h2>
                  <p className="text-size-medium aether-body">
                    Every surface, edge, and curve exists for a reason. Machined from a single aluminum billet, the Aether body achieves a drag coefficient of 0.19 — the lowest of any production vehicle.
                  </p>
                  <ul className="aether-feature-list">
                    <li>Single-piece aluminum monocoque</li>
                    <li>Frameless panoramic glass roof</li>
                    <li>Touch-sensitive flush door handles</li>
                  </ul>
                </div>
                <div className="aether-design-image">
                  <div className="aether-design-img-wrap">
                    <Image
                      src="/aether-car.png"
                      alt="Apple Aether Design Detail"
                      fill
                      className="aether-design-img"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="aether-design-caption">Cd 0.19 · Aerodynamic Coefficient</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <p className="aether-eyebrow aether-eyebrow--light">Performance</p>
                <h2 className="heading-style-h2 aether-section-title aether-section-title--light">
                  Nothing else<br />comes close.
                </h2>
                <div className="aether-stats-grid">
                  {STATS.map((s) => (
                    <StatItem key={s.label} {...s} trigger={perfInView} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ── */}
      <section className="aether-technology" id="technology">
        <div className="aether-tech-header">
          <div className="padding-global">
            <div className="container-large">
              <p className="aether-eyebrow">Apple Ecosystem</p>
              <h2 className="heading-style-h2 aether-section-title">Everything connected.<br />Nothing complicated.</h2>
            </div>
          </div>
        </div>

        <div className="aether-tech-scroll-wrap">
          <div className="aether-tech-scroll" ref={techRef} onScroll={handleTechScroll}>
            {TECH_PANELS.map((panel, i) => (
              <div key={i} className="aether-tech-panel">
                <div className="aether-tech-panel-inner">
                  <span className="aether-tech-icon">{panel.icon}</span>
                  <p className="aether-eyebrow">{panel.tag}</p>
                  <h3 className="heading-style-h3 aether-tech-title">{panel.title}</h3>
                  <p className="text-size-medium aether-body">{panel.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="aether-tech-dots">
            {TECH_PANELS.map((_, i) => (
              <button
                key={i}
                className={`aether-tech-dot ${i === techIndex ? "aether-tech-dot--active" : ""}`}
                onClick={() => {
                  if (!techRef.current) return;
                  techRef.current.scrollTo({ left: i * techRef.current.offsetWidth, behavior: "smooth" });
                }}
                aria-label={`Panel ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERIOR ── */}
      <section className="aether-interior" id="safety">
        <div className="aether-interior-image-wrap">
          <Image
            src="/aether-interior.png"
            alt="Apple Aether Interior"
            fill
            className="aether-interior-img"
            sizes="100vw"
          />
          <div className="aether-interior-overlay" />
        </div>
        <div className="padding-global aether-interior-content-wrap">
          <div className="container-medium">
            <div className="padding-section-large">
              <div className="aether-interior-component">
                <p className="aether-eyebrow aether-eyebrow--light">Interior</p>
                <h2 className="heading-style-h2 aether-section-title aether-section-title--light">
                  Zero buttons.<br />Total control.
                </h2>
                <p className="text-size-medium aether-body aether-body--light">
                  The Aether cabin removes everything that shouldn&apos;t be there. A single curved display spans the full dashboard. The rest is silence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUSTAINABILITY ── */}
      <section className="aether-sustainability">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="aether-sustain-component">
                <div className="aether-sustain-header">
                  <p className="aether-eyebrow">Environment</p>
                  <h2 className="heading-style-h2 aether-section-title">Built for the planet.<br />Not just for you.</h2>
                </div>
                <div className="aether-sustain-grid">
                  {SUSTAINABILITY.map((item) => (
                    <div key={item.title} className="aether-sustain-item">
                      <span className="aether-sustain-icon">{item.icon}</span>
                      <h3 className="heading-style-h5 aether-sustain-title">{item.title}</h3>
                      <p className="text-size-small aether-body">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="aether-pricing" id="order">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="aether-pricing-component">
                <p className="aether-eyebrow">Choose Yours</p>
                <h2 className="heading-style-h2 aether-section-title">Every model.<br />Uncompromised.</h2>
                <div className="aether-pricing-grid">
                  {PRICING.map((model) => (
                    <div
                      key={model.name}
                      className={`aether-pricing-card ${model.featured ? "aether-pricing-card--featured" : ""}`}
                      style={{ background: model.color, color: model.textColor }}
                    >
                      {model.featured && <div className="aether-pricing-badge">Most Popular</div>}
                      <div className="aether-pricing-top">
                        <h3 className="heading-style-h4">{model.name}</h3>
                        <p className="aether-pricing-price">{model.price}</p>
                      </div>
                      <ul className="aether-pricing-specs">
                        <li><span>Range</span><strong>{model.range}</strong></li>
                        <li><span>Power</span><strong>{model.power}</strong></li>
                        <li><span>0–100</span><strong>{model.acceleration}</strong></li>
                      </ul>
                      <a
                        href="#"
                        className="aether-pricing-cta"
                        style={{ color: model.textColor, borderColor: model.textColor }}
                      >
                        Pre-order →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    <li><a href="#">Technology</a></li>
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
