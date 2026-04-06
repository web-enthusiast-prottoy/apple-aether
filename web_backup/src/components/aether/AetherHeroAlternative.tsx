"use client";

import { useEffect, useRef } from "react";
import "./AetherHeroAlternative.css";

const TOTAL = 58;
const FRAMES = Array.from({ length: TOTAL }).map(
  (_, i) => `/aether-hero-alternative/frame-${(i + 1).toString().padStart(4, "0")}.png`
);

export default function AetherHeroAlternative() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLeftRef = useRef<HTMLSpanElement>(null);
  const textRightRef = useRef<HTMLSpanElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // ── 1. Preload all frames ──────────────────────────────────────────
    const images: HTMLImageElement[] = new Array(TOTAL);
    let loaded = 0;

    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = images[index];
      if (!img?.complete) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Cover-fit the image on canvas
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };

    const initGSAP = async () => {
      // Dynamic import so it's client-only
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const textLeft = textLeftRef.current;
      const textRight = textRightRef.current;
      if (!section || !textLeft || !textRight) return;

      // ── 2. Resize canvas to match section ────────────────────────────
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        drawFrame(frameIndexRef.current);
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      // ── 3. ScrollTrigger: pin + scrub across 300vh ───────────────────
      const proxy = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      // Frame sequence tween
      tl.to(proxy, {
        frame: TOTAL - 1,
        snap: "frame",
        ease: "none",
        onUpdate() {
          const idx = Math.round(proxy.frame);
          if (idx !== frameIndexRef.current) {
            frameIndexRef.current = idx;
            drawFrame(idx);
          }
        },
      });

      // Text separation — runs in parallel with frame playback
      tl.to(
        textLeft,
        { x: "-45vw", ease: "none" },
        0 // start at the same time as frames
      );
      tl.to(
        textRight,
        { x: "45vw", ease: "none" },
        0
      );

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        ScrollTrigger.getAll().forEach((t) => t.kill());
        const currentRaf = rafRef.current;
        if (currentRaf) cancelAnimationFrame(currentRaf);
      };
    };

    // Load all images, draw frame 0 as soon as it's ready, init GSAP when all done
    FRAMES.forEach((src, i) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        images[i] = img;
        if (i === 0) drawFrame(0); // show frame 0 immediately
        loaded++;
        if (loaded === TOTAL) {
          imagesRef.current = images; // We can store this if needed later
          initGSAP();
        }
      };
      img.onerror = () => {
        // Still count it loaded so we don't block
        loaded++;
        if (loaded === TOTAL) {
          imagesRef.current = images;
          initGSAP();
        }
      };
    });

    return () => {
      const currentRaf = rafRef.current;
      if (currentRaf) cancelAnimationFrame(currentRaf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-v2-alt" id="overview-alt" aria-label="Apple Aether Hero Alternative">
      {/* Full-screen canvas for frame sequence */}
      <canvas ref={canvasRef} className="hero-v2-alt__canvas" aria-hidden="true" />

      {/* Split word marks */}
      <div className="hero-v2-alt__words" aria-hidden="true">
        <span ref={textLeftRef} className="hero-v2-alt__word hero-v2-alt__word--left">Apple</span>
        <span ref={textRightRef} className="hero-v2-alt__word hero-v2-alt__word--right">Aether</span>
      </div>

    </section>
  );
}
