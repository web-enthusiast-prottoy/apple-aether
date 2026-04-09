"use client";

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * AetherSmoothScroll
 * subtle smooth scrolling with Lenis, synced with GSAP ScrollTrigger.
 */
export default function AetherSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Initialize Lenis
    const lenis = new Lenis({
      duration: 1.4, // Subtle, slightly longer duration for cinematic feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard gentle easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5, // slightly more responsive on touch if enabled
      infinite: false,
    });

    lenisRef.current = lenis;

    // 2. Hook into GSAP ScrollTrigger
    // Since we use the global window.gsap, we access it here
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;

    if (gsap && ScrollTrigger) {
      // Sync Lenis with ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Add Lenis's raf to GSAP ticker for perfect synchronization
      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000); // converting to ms
      });

      // Reset ticker on cleanup
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback: use built-in RAF if GSAP isn't ready
      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // 3. Global access for convenience (optional)
    (window as any).AetherLenis = lenis;

    return () => {
      lenis.destroy();
      if (gsap && gsap.ticker) {
        gsap.ticker.remove(() => {});
      }
    };
  }, []);

  return null; // Side-effect only component
}
