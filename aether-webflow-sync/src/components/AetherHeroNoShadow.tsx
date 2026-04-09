"use client";

import { useEffect, useRef, useState } from "react";
import "./AetherHeroNoShadow.css";

const TOTAL = 49;
const FRAMES = Array.from({ length: TOTAL }).map(
  (_, i) => `https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/apple-aether-hero-no-shadow/frame-${(i + 1).toString().padStart(4, "0")}.png`
);

export default function AetherHeroNoShadow() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLeftRef = useRef<HTMLSpanElement>(null);
  const textRightRef = useRef<HTMLSpanElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);
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

  // 2. Loader Synchronization (Special for Sync/Webflow standalone roots)
  useEffect(() => {
    // Check if body already has the class
    if (document.body.classList.contains("aether-loaded")) {
      setIsLoaderFinished(true);
      return;
    }

    // Otherwise observe the body for the class
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains("aether-loaded")) {
        setIsLoaderFinished(true);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 3. Canvas Drawing Logic
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img) return;

    // Measurement using Client Rect ensures we handle CSS scaling and initial 0-sizes better
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    } else if (canvas.width === 0) {
      // Fallback for initial measure if bounding rect is somehow weird
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    if (canvas.width === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isMobile = canvas.width < 768;
    const baseScale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const scale = isMobile ? baseScale * 0.7 : baseScale;
    
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  };

  // 4. Initial Frame and Resize
  useEffect(() => {
    if (!imagesLoaded) return;

    const handleResize = () => {
      drawFrame(frameIndexRef.current);
    };

    // Draw first frame immediately when assets are ready
    handleResize(); 
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imagesLoaded]);

  // 5. GSAP Initialization
  useEffect(() => {
    // Only init GSAP if images are loaded AND loader is finished
    if (!imagesLoaded || !isLoaderFinished) return;

    let ctx: any;

    const initGSAP = async () => {
      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      
      if (!gsap || !ScrollTrigger) return;
      
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
            end: "+=300%", // Longer distance for cinematic feel
            pin: true,
            scrub: true,
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
      });

      gsapCleanupRef.current = () => ctx && ctx.revert();
    };

    initGSAP();

    return () => {
      if (gsapCleanupRef.current) gsapCleanupRef.current();
    };
  }, [imagesLoaded, isLoaderFinished]);

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
