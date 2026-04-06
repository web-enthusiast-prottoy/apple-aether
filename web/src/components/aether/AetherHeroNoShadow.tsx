"use client";

import { useEffect, useRef, useState } from "react";
import "./AetherHeroNoShadow.css";

const TOTAL = 49;
const FRAMES = Array.from({ length: TOTAL }).map(
  (_, i) => `/apple-aether-hero-no-shadow/frame-${(i + 1).toString().padStart(4, "0")}.png`
);

interface AetherHeroNoShadowProps {
  isParentLoading?: boolean;
}

export default function AetherHeroNoShadow({ isParentLoading = false }: AetherHeroNoShadowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLeftRef = useRef<HTMLSpanElement>(null);
  const textRightRef = useRef<HTMLSpanElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const gsapCleanupRef = useRef<(() => void) | null>(null);

  // 1. Image Preloading
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL);
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === TOTAL) {
        imagesRef.current = images;
        setImagesLoaded(true);
      }
    };

    FRAMES.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        images[i] = img;
        checkAllLoaded();
      };
      img.onerror = () => {
        console.error(`Failed to load frame ${i}: ${src}`);
        checkAllLoaded();
      };
    });
  }, []);

  // 2. Canvas Drawing Logic
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img) return;

    // Ensure canvas matches its display size
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  };

  // 3. Initial Frame and Resize
  useEffect(() => {
    if (!imagesLoaded) return;

    const handleResize = () => {
      drawFrame(frameIndexRef.current);
    };

    handleResize(); // Draw initial frame
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imagesLoaded]);

  // 4. GSAP Initialization
  useEffect(() => {
    // Only init GSAP if images are loaded AND parent loader is done
    if (!imagesLoaded || isParentLoading) return;

    let ctx: any;

    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const textLeft = textLeftRef.current;
      const textRight = textRightRef.current;
      if (!section || !textLeft || !textRight) return;

      ctx = gsap.context(() => {
        const proxy = { frame: 0 };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=300%", // Increased for smoother scroll
            pin: true,
            scrub: 2, // Smoother scrub
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(proxy, {
          frame: TOTAL - 1,
          ease: "none",
          onUpdate() {
            const idx = Math.round(proxy.frame);
            if (idx !== frameIndexRef.current) {
              frameIndexRef.current = idx;
              drawFrame(idx);
            }
          },
        });

        // Split text animation without fade
        tl.to(textLeft, { x: "-40vw", ease: "power2.inOut" }, 0);
        tl.to(textRight, { x: "40vw", ease: "power2.inOut" }, 0);
        
        // Ensure everything is calculated correctly
        ScrollTrigger.refresh();
      });

      gsapCleanupRef.current = () => ctx && ctx.revert();
    };

    initGSAP();

    return () => {
      if (gsapCleanupRef.current) gsapCleanupRef.current();
    };
  }, [imagesLoaded, isParentLoading]);

  return (
    <section ref={sectionRef} className="hero-v2-ns" id="overview" aria-label="Apple Aether Hero">
      <canvas 
        ref={canvasRef} 
        className="hero-v2-ns__canvas" 
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      <div className="hero-v2-ns__words" aria-hidden="true">
        <span ref={textLeftRef} className="hero-v2-ns__word hero-v2-ns__word--left">
          Apple
        </span>
        <span ref={textRightRef} className="hero-v2-ns__word hero-v2-ns__word--right">
          Aether
        </span>
      </div>
    </section>
  );
}
