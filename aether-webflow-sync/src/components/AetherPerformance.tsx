import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
    { value: 2.1, unit: "s", label: "0–100 km/h", decimals: 1 },
    { value: 720, unit: "km", label: "Estimated Range", decimals: 0 },
    { value: 900, unit: "hp", label: "Peak Power", decimals: 0 },
    { value: 15, unit: "min", label: "0–80% Charge", decimals: 0 },
];

export default function AetherPerformance() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const titleLines = Array.from(
            section.querySelectorAll<HTMLElement>(".aether-perf-title-line"),
        );
        const statItems = Array.from(
            section.querySelectorAll<HTMLElement>(".aether-stat"),
        );
        const numberEls = Array.from(
            section.querySelectorAll<HTMLElement>(".aether-stat-value"),
        );

        // --- Set initial hidden state ---
        gsap.set(titleLines, { y: 60, opacity: 0 });
        gsap.set(statItems, { y: 50, opacity: 0 });

        // --- Use IntersectionObserver as the trigger ---
        // This fires reliably at the moment the section actually enters the viewport,
        // regardless of how much the page height changed after mount (3D models, etc.)
        let triggered = false;
        const observer = new IntersectionObserver(
            (entries) => {
                if (triggered || !entries[0].isIntersecting) return;
                triggered = true;
                observer.disconnect();

                // 1. Animate hero text lines sliding in
                const tl = gsap.timeline();

                tl.to(titleLines, {
                    y: 0,
                    opacity: 1,
                    duration: 1.0,
                    stagger: 0.18,
                    ease: "power4.out",
                });

                // 2. Animate stat cards sliding in with stagger
                tl.to(
                    statItems,
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.12,
                        ease: "power3.out",
                    },
                    "-=0.5", // overlap with title anim
                );

                // 3. Count-up each number (staggered to match card reveal)
                numberEls.forEach((el, i) => {
                    const stat = STATS[i];
                    if (!stat) return;

                    const counter = { val: 0 };
                    // Start count-up slightly offset per card
                    tl.to(
                        counter,
                        {
                            val: stat.value,
                            duration: 1.8,
                            ease: "power2.out",
                            onUpdate: () => {
                                el.textContent =
                                    stat.decimals > 0
                                        ? counter.val.toFixed(stat.decimals)
                                        : String(Math.round(counter.val));
                            },
                        },
                        // Each counter starts when its card starts revealing
                        `-=${1.8 - i * 0.12}`,
                    );
                });
            },
            { threshold: 0.25 }, // fire when 25% of section is visible
        );

        observer.observe(section);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <section
            className="aether-performance"
            id="performance"
            ref={sectionRef}
        >
            <div className="aether-perf-bg">
                <div className="aether-speed-lines">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="aether-speed-line"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>

            <div className="padding-global">
                <div className="container-large">
                    <div className="padding-section-large">
                        <div className="aether-perf-component">
                            <h2 className="heading-style-h2 aether-section-title aether-section-title--light">
                                <span className="display-block aether-perf-title-line">
                                    Nothing else,
                                </span>
                                <span className="display-block aether-perf-title-line">
                                    comes close.
                                </span>
                            </h2>

                            <div className="aether-stats-grid">
                                {STATS.map((s) => (
                                    <div key={s.label} className="aether-stat">
                                        <span className="aether-stat-number">
                                            <span className="aether-stat-value">
                                                {s.decimals > 0
                                                    ? s.value.toFixed(
                                                          s.decimals,
                                                      )
                                                    : s.value}
                                            </span>
                                            {s.unit}
                                        </span>
                                        <span className="aether-stat-label">
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
