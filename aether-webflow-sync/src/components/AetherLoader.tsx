import { useEffect, useRef, useState } from "react";

const gsap = (window as any).gsap;

export default function AetherLoader({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topHalfRef = useRef<HTMLDivElement>(null);
  const bottomHalfRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const logoRef = useRef<SVGSVGElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const barContainerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        document.body.classList.add("aether-loaded");
        onComplete?.();
      }
    });

    // 1. Initial fade in for the content
    tl.fromTo(logoRef.current, 
      { scale: 0.95, opacity: 0, filter: "blur(10px)" }, 
      { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power2.out" }, 
      0
    );
    
    tl.fromTo(textContainerRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
      0.2
    );
    
    tl.fromTo(barContainerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" },
      0.4
    );

    // Fade in car and shift slightly
    tl.fromTo(carRef.current,
      { opacity: 0, xPercent: -120 },
      { opacity: 1, xPercent: -100, duration: 0.8, ease: "power2.out" },
      0.4
    );

    // 2. Animate the progress and the car driving
    const progressValue = { val: 0 };
    tl.to(progressValue, {
      val: 100,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => setProgress(Math.round(progressValue.val)),
    }, 0);

    tl.fromTo(barRef.current, 
      { scaleX: 0 }, 
      { scaleX: 1, duration: 3, ease: "power2.inOut", transformOrigin: "left center" }, 
      0
    );

    // The car drives from left to right along the bar
    tl.fromTo(carRef.current,
      { left: "0%" },
      { left: "100%", duration: 3, ease: "power2.inOut" },
      0
    );

    // 3. Exit Transition: "Hyper-speed" leaving
    const speedOffTime = 3.0; // Wait till 100%
    
    // Car speeds away off-screen
    tl.to(carRef.current, { 
      x: 150, 
      xPercent: -100, // maintain alignment while adding flat x
      opacity: 0, 
      scaleX: 1.5, // Stretch effect
      duration: 0.4, 
      ease: "power2.in" 
    }, speedOffTime);

    // Scale up and blur the rest of the content
    tl.to(contentRef.current, { 
      scale: 1.1, 
      opacity: 0, 
      filter: "blur(10px)",
      duration: 0.6, 
      ease: "power2.inOut" 
    }, speedOffTime + 0.2);

    // Splitting door effect to reveal the site!
    tl.to(topHalfRef.current, { y: "-100%", duration: 0.8, ease: "power3.inOut" }, speedOffTime + 0.4);
    tl.to(bottomHalfRef.current, { y: "100%", duration: 0.8, ease: "power3.inOut" }, speedOffTime + 0.4);

    // Final kill
    tl.set(containerRef.current, { pointerEvents: "none", display: "none" });

    return () => {
      document.body.style.overflow = "";
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden">
      {/* Black Splitting Backgrounds */}
      <div ref={topHalfRef} className="absolute top-0 left-0 w-full h-1/2 bg-[#000000] pointer-events-auto" />
      <div ref={bottomHalfRef} className="absolute bottom-0 left-0 w-full h-1/2 bg-[#000000] pointer-events-auto" />
      
      {/* Loader Content */}
      <div ref={contentRef} className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-auto">
        <svg 
          ref={logoRef}
          width="56" 
          height="56" 
          viewBox="0 0 814 1000" 
          fill="#FFFFFF"
          className="mb-8"
          style={{ opacity: 0 }}
        >
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 268.7-317.3 70.6 0 129.5 45.1 173.3 45.1 41.8 0 112.9-48.3 190.1-48.3 30.5 0 108.2 2.6 168.3 80.2zm-234.3-126.3c27.8-30.5 48.3-69.4 48.3-108.2 0-5.8-.6-11.6-1.3-16.8-47.1 1.9-103 31.8-136.8 63.5-27.8 27.2-51.5 66.1-51.5 105.6 0 6.4.6 12.9 1.3 18 4.5.6 10.3.7 15.3.7 42.8 0 96.9-20.7 124.7-62.8z" />
        </svg>
        
        <div ref={textContainerRef} className="flex flex-col items-center gap-2" style={{ opacity: 0 }}>
          <div className="text-white/40 text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase origin-center">
            Aether
          </div>
          <div 
            className="text-white text-3xl sm:text-4xl font-light tracking-tight tabular-nums"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {progress}%
          </div>
        </div>
        
        <div ref={barContainerRef} className="absolute bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 w-56 sm:w-72" style={{ opacity: 0 }}>
          {/* Futuristic Car Minimal SVG */}
          <div 
            ref={carRef} 
            className="absolute -top-6 w-[60px] h-[20px] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            style={{ left: "0%", opacity: 0 }}
          >
            {/* Speed streaks behind the car */}
            <div className="absolute top-1/2 -left-8 w-6 h-[1px] bg-gradient-to-l from-white/60 to-transparent -translate-y-1/2 rounded-full" />
            <div className="absolute top-1/2 -left-4 w-3 h-[1px] bg-gradient-to-l from-white/80 to-transparent translate-y-2 rounded-full" />
            
            <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M15 30H10C6.68629 30 4 27.3137 4 24V21.134C4 19.3444 4.96541 17.6976 6.51868 16.843L20 9.427C21.849 8.41006 23.9458 7.87707 26.071 7.87707H33.37L48.1189 2.96102C53.7667 1.07841 59.8164 0.654854 65.733 1.73977L95.556 7.207C100.939 8.19363 105.748 11.0844 109.117 15.3524L114.622 22.3273C115.485 23.42 115.968 24.7731 115.996 26.1774L116 30H100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="23" cy="30" r="8" stroke="currentColor" strokeWidth="3"/>
              <circle cx="85" cy="30" r="8" stroke="currentColor" strokeWidth="3"/>
              <path d="M48 30H60" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div 
              ref={barRef}
              className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
