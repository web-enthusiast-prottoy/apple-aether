
import { useEffect, useRef } from "react";
import "./AetherHero.css";

const FRAMES = [
  "/aether-hero/nobg-1774556531320-frame-0001.png",
  "/aether-hero/nobg-1774556535274-frame-0002.png",
  "/aether-hero/nobg-1774556537025-frame-0003.png",
  "/aether-hero/nobg-1774556538723-frame-0004.png",
  "/aether-hero/nobg-1774556540440-frame-0005.png",
  "/aether-hero/nobg-1774556542318-frame-0006.png",
  "/aether-hero/nobg-1774556544044-frame-0007.png",
  "/aether-hero/nobg-1774556545706-frame-0008.png",
  "/aether-hero/nobg-1774556547413-frame-0009.png",
  "/aether-hero/nobg-1774556549101-frame-0010.png",
  "/aether-hero/nobg-1774556550798-frame-0011.png",
  "/aether-hero/nobg-1774556552442-frame-0012.png",
  "/aether-hero/nobg-1774556554129-frame-0013.png",
  "/aether-hero/nobg-1774556555810-frame-0014.png",
  "/aether-hero/nobg-1774556557456-frame-0015.png",
  "/aether-hero/nobg-1774556559120-frame-0016.png",
  "/aether-hero/nobg-1774556560761-frame-0017.png",
  "/aether-hero/nobg-1774556562436-frame-0018.png",
  "/aether-hero/nobg-1774556564283-frame-0019.png",
  "/aether-hero/nobg-1774556566080-frame-0020.png",
  "/aether-hero/nobg-1774556567864-frame-0021.png",
  "/aether-hero/nobg-1774556569613-frame-0022.png",
  "/aether-hero/nobg-1774556571386-frame-0023.png",
  "/aether-hero/nobg-1774556573134-frame-0024.png",
  "/aether-hero/nobg-1774556575165-frame-0025.png",
  "/aether-hero/nobg-1774556577433-frame-0026.png",
  "/aether-hero/nobg-1774556579243-frame-0027.png",
  "/aether-hero/nobg-1774556581084-frame-0028.png",
  "/aether-hero/nobg-1774556582813-frame-0029.png",
  "/aether-hero/nobg-1774556584615-frame-0030.png",
  "/aether-hero/nobg-1774556586301-frame-0031.png",
  "/aether-hero/nobg-1774556588210-frame-0032.png",
  "/aether-hero/nobg-1774556590019-frame-0033.png",
  "/aether-hero/nobg-1774556591759-frame-0034.png",
  "/aether-hero/nobg-1774556593424-frame-0035.png",
  "/aether-hero/nobg-1774556595144-frame-0036.png",
  "/aether-hero/nobg-1774556596809-frame-0037.png",
  "/aether-hero/nobg-1774556598525-frame-0038.png",
  "/aether-hero/nobg-1774556600602-frame-0039.png",
  "/aether-hero/nobg-1774556602351-frame-0040.png",
  "/aether-hero/nobg-1774556604818-frame-0041.png",
  "/aether-hero/nobg-1774556607210-frame-0042.png",
  "/aether-hero/nobg-1774556609835-frame-0043.png",
  "/aether-hero/nobg-1774556611674-frame-0044.png",
  "/aether-hero/nobg-1774556613426-frame-0045.png",
  "/aether-hero/nobg-1774556615235-frame-0046.png",
  "/aether-hero/nobg-1774556616912-frame-0047.png",
  "/aether-hero/nobg-1774556618572-frame-0048.png",
  "/aether-hero/nobg-1774556620230-frame-0049.png",
  "/aether-hero/nobg-1774556621955-frame-0050.png",
  "/aether-hero/nobg-1774556623672-frame-0051.png",
  "/aether-hero/nobg-1774556625359-frame-0052.png",
  "/aether-hero/nobg-1774556627089-frame-0053.png",
  "/aether-hero/nobg-1774556628766-frame-0054.png",
  "/aether-hero/nobg-1774556630547-frame-0055.png",
  "/aether-hero/nobg-1774556632210-frame-0056.png",
  "/aether-hero/nobg-1774556633938-frame-0057.png",
  "/aether-hero/nobg-1774556635621-frame-0058.png",
];

const TOTAL = FRAMES.length; // 58

export default function AetherHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLeftRef = useRef<HTMLSpanElement>(null);
  const textRightRef = useRef<HTMLSpanElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let resizeHandler: () => void;
    let cleanupGSAP: (() => void) | null = null;
    let isCanceled = false;

    const images: HTMLImageElement[] = new Array(TOTAL);
    let canvasW = 0;
    let canvasH = 0;

    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = images[index];
      if (!img?.complete) return;

      ctx.clearRect(0, 0, canvasW, canvasH);
      
      // Responsive scale logic
      const isMobile = canvasW < 768;
      const baseScale = Math.max(canvasW / img.naturalWidth, canvasH / img.naturalHeight);
      const scale = isMobile ? baseScale * 0.7 : baseScale;

      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvasW - w) / 2;
      const y = (canvasH - h) / 2;
      
      ctx.drawImage(img, x, y, w, h);
    };

    const initGSAP = async () => {
      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      if (isCanceled || !gsap || !ScrollTrigger) return;

      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const textLeft = textLeftRef.current;
      const textRight = textRightRef.current;
      const canvas = canvasRef.current;
      
      if (!section || !textLeft || !textRight || !canvas) return;

      const resizeCanvas = () => {
        canvasW = section.offsetWidth;
        canvasH = section.offsetHeight;
        canvas.width = canvasW;
        canvas.height = canvasH;
        drawFrame(frameIndexRef.current);
      };
      
      resizeCanvas();
      resizeHandler = resizeCanvas;
      window.addEventListener("resize", resizeHandler);

      const proxy = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 0.75, // Lowered from 2 to reduce latency/lag feeling
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
            // Draw synchronously. Since we pre-decode, this is butter smooth.
            drawFrame(idx);
          }
        },
      });

      // Text separation 
      tl.to(textLeft, { x: "-45vw", ease: "none" }, 0);
      tl.to(textRight, { x: "45vw", ease: "none" }, 0);

      cleanupGSAP = () => {
        window.removeEventListener("resize", resizeHandler);
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    };

    // 1. Initialize GSAP immediately so pinning layout isn't blocked by network
    initGSAP();

    // 2. Preload and decode images in background
    let loaded = 0;
    FRAMES.forEach((src, i) => {
      const img = new window.Image();
      img.src = src;
      img.onload = async () => {
        // Force asynchronous decode to prevent main thread blocking when drawn
        try {
          await img.decode();
        } catch (e) {
          // ignore
        }
        
        if (isCanceled) return;
        images[i] = img;
        
        if (i === 0 || i === frameIndexRef.current) {
          drawFrame(i); 
        }
        
        loaded++;
        if (loaded === TOTAL) {
          imagesRef.current = images;
        }
      };
      img.onerror = () => {
        loaded++;
      };
    });

    return () => {
      isCanceled = true;
      if (cleanupGSAP) cleanupGSAP();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-v2" id="overview" aria-label="Apple Aether Hero">
      {/* Full-screen canvas for frame sequence */}
      <canvas ref={canvasRef} className="hero-v2__canvas" aria-hidden="true" />

      {/* Split word marks */}
      <div className="hero-v2__words" aria-hidden="true">
        <span ref={textLeftRef} className="hero-v2__word hero-v2__word--left">Apple</span>
        <span ref={textRightRef} className="hero-v2__word hero-v2__word--right">Aether</span>
      </div>

    </section>
  );
}
