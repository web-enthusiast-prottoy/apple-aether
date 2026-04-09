import { useEffect, useRef, useState } from "react";
import "./AetherCloserLook.css";

const gsap = (window as any).gsap;
const ScrollTrigger = (window as any).ScrollTrigger;

if (typeof window !== "undefined" && gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AetherTab {
  id: string;
  label: string;
  image: string;
  headline: string;
  body: string;
  isTransparent?: boolean;
}

const TABS: AetherTab[] = [
  {
    id: "exterior",
    label: "Exterior",
    image: "https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/take-a-look/aether-exterior.png",
    headline: "Seamless design.",
    body: "Apple Aether is sculpted as one continuous surface, with refined aerodynamics to help it reach an incredibly low drag coefficiency.",
    isTransparent: true
  },
  {
    id: "interior",
    label: "Interior",
    image: "https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/take-a-look/aether-interior.webp",
    headline: "Space, reimagined.",
    body: "A calm interior where controls appear only when needed, and every surface is designed to reduce noise, distraction, and effort.",
  },
  {
    id: "interface",
    label: "Interface",
    image: "https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/take-a-look/aether-interface.webp",
    headline: "The interface that waits.",
    body: "Voice, touch, gesture, and spatial controls work together so information appears at the right time, in the right place.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    image: "https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/take-a-look/aether-intelligence.webp",
    headline: "Intelligence, built in.",
    body: "Apple Aether continuously understands its surroundings, adapts to you, and works seamlessly across your Apple ecosystem.",
  },
  {
    id: "safety",
    label: "Safety",
    image: "https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/take-a-look/aether-safety.webp",
    headline: "Confidence everywhere.",
    body: "Advanced sensing and intelligent assistance help every drive feel more aware, more responsive, and more at ease.",
  },
  {
    id: "charging",
    label: "Charging",
    image: "https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/take-a-look/aether-charging.webp",
    headline: "Power, without the pause.",
    body: "Fast charging, smart scheduling, and route-aware energy guidance keep Aether ready when you are.",
  },
];

function TabIcon({ active }: { active: boolean }) {
  return (
    <span className={`acl-pill__icon ${active ? "acl-pill__icon--active" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.2" />
        <line 
          x1="10" y1="6.5" x2="10" y2="13.5" 
          stroke="currentColor" 
          strokeWidth="1.3" 
          strokeLinecap="round" 
        />
        <line 
          x1="6.5" y1="10" x2="13.5" y2="10" 
          stroke="currentColor" 
          strokeWidth="1.3" 
          strokeLinecap="round" 
        />
      </svg>
    </span>
  );
}

export default function AetherCloserLook() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<any>(null);

  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const defaultImageRef = useRef<HTMLImageElement>(null);
  
  // Refs for custom GSAP accordion
  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const bodyRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    gsapRef.current = gsap;
    let observer: IntersectionObserver;

    let ctx = gsap.context(() => {
      // Init Images
      TABS.forEach(tab => {
        if (imageRefs.current[tab.id]) {
          const isTransparent = tab.isTransparent;
          gsap.set(imageRefs.current[tab.id], { 
            opacity: 0, 
            yPercent: isTransparent ? -50 : 0, 
            scale: isTransparent ? 0.95 : 1.05 
          });
        }
      });
      
      const entryTl = gsap.timeline({ paused: true });

      if (defaultImageRef.current) {
        gsap.set(defaultImageRef.current, { opacity: 0, yPercent: -50, x: 100, scale: 1.05 });
        entryTl.to(defaultImageRef.current, 
          { x: 0, scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" }, 
          0
        );
      }

      // Cool cascade entry for tab buttons
      const tabWrappers = TABS.map(t => wrapperRefs.current[t.id]).filter(Boolean);
      if (tabWrappers.length) {
        gsap.set(tabWrappers, { opacity: 0, y: 40 });
        entryTl.to(tabWrappers, 
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 
          0.2 // Start slightly after the image
        );
      }
      
      // Fallback intersection observer, much more robust against lenis/smooth-scrollbar overrides
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            entryTl.play();
            observer.disconnect();
          }
        },
        { threshold: 0.35 } // Trigger when 35% of the canvas wrapper is visible
      );

      if (canvasRef.current) {
        observer.observe(canvasRef.current);
      }
      
      // Init Tabs: default height 56px, active content hidden
      TABS.forEach(tab => {
        const body = bodyRefs.current[tab.id];
        if (body) {
           gsap.set(body, { opacity: 0, scale: 0.95 });
        }
      });
    }, sectionRef);

    return () => {
      ctx.revert(); // Will now correctly and synchronously revert the single strict-mode pass
      if (observer) observer.disconnect();
    };
  }, []);

  const handleTabChange = (newId: string) => {
    if (!gsapRef.current || isAnimating) return;
    const gsap = gsapRef.current;
    
    setIsAnimating(true);
    
    const isClosing = newId === activeId;
    const targetId = isClosing ? null : newId;
    
    // --- IMAGES --- //
    const outImg = activeId && imageRefs.current[activeId] ? imageRefs.current[activeId] : defaultImageRef.current;
    const inImg = targetId && imageRefs.current[targetId] ? imageRefs.current[targetId] : defaultImageRef.current;
    
    if (outImg && inImg && outImg !== inImg) {
      const isOutTransparent = outImg.classList.contains("img-transparent");
      const isInTransparent = inImg.classList.contains("img-transparent");
      
      const imgTl = gsap.timeline();

      // Close Outgoing image first
      imgTl.to(outImg, { 
        opacity: 0, 
        x: isOutTransparent ? -60 : 0, 
        scale: isOutTransparent ? 0.95 : 1.05, 
        duration: 0.5, 
        ease: "power2.in",
        zIndex: 1
      });

      // Show Incoming image sequentially
      imgTl.set(inImg, { zIndex: 2 });
      if (isInTransparent) {
        imgTl.fromTo(inImg, 
          { opacity: 0, x: 120, scale: 0.85 }, 
          { opacity: 1, x: 0, scale: 1, duration: 1.0, ease: "power3.out" },
          "+=0" // Starts right as outgoing completes
        );
      } else {
        /* Scale from 1.05 to 1.0 prevents image background edges from being visible during transition */
        imgTl.fromTo(inImg, 
          { opacity: 0, scale: 1.05, x: 0 }, 
          { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" },
          "+=0" // Starts right as outgoing completes
        );
      }
    }

    // --- ACCORDION (100% Sychronized with explicit fromTo to block React class-update snaps) --- //
    const tl = gsap.timeline({ 
      onComplete: () => {
        setIsAnimating(false);
        // Clear inline GSAP width/height so CSS dynamically recalculates on window resizes
        if (activeId && wrapperRefs.current[activeId]) {
           gsap.set(wrapperRefs.current[activeId], { clearProps: "width,height" });
        }
        if (targetId && wrapperRefs.current[targetId]) {
           gsap.set(wrapperRefs.current[targetId], { clearProps: "width,height" });
        }
      }
    });

    // Outgoing Tab
    if (activeId && wrapperRefs.current[activeId]) {
      const wrapper = wrapperRefs.current[activeId];
      const header = headerRefs.current[activeId];
      const body = bodyRefs.current[activeId];
      
      const startWidth = wrapper.offsetWidth;
      const targetWidth = header ? header.offsetWidth : 150;
      
      // Force GSAP to transition cleanly from exactly where the element is presently computed
      tl.fromTo(wrapper, 
        { width: startWidth, height: wrapper.offsetHeight }, 
        { height: 56, width: targetWidth, duration: 0.5, ease: "power3.inOut" }, 
        0
      );
      tl.fromTo(body, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.97, duration: 0.3, ease: "power2.in" }, 0);
      tl.fromTo(header, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.2);
    }

    // Incoming Tab
    if (targetId && wrapperRefs.current[targetId]) {
      const wrapper = wrapperRefs.current[targetId];
      const header = headerRefs.current[targetId];
      const body = bodyRefs.current[targetId];
      if (!body) return;
      
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;
      
      // 1. Calculate the real target width we WANT to reach
      let targetWidth;
      if (isMobile) {
        // Match the CSS: calc(100% - 40px) or (100% - 32px)
        const parentWidth = canvasRef.current?.offsetWidth || window.innerWidth;
        targetWidth = parentWidth - (isSmallMobile ? 32 : 40);
      } else {
        targetWidth = 320;
      }

      // 2. Measure how tall the body is at THAT specific width
      // We temporarily force these styles to get an accurate content height measurement
      gsap.set(body, { 
        width: targetWidth, 
        position: "relative", // temporary relative to measure height correctly
        opacity: 0, 
        display: "block" 
      });
      const targetHeight = body.offsetHeight;
      // Revert body immediately so it doesn't flicker or mess up the DOM
      gsap.set(body, { clearProps: "width,position,display,opacity" });

      const startWidth = wrapper.offsetWidth;
      
      // Start rigidly at 56px height & current width constraints to block CSS snapping
      tl.fromTo(wrapper, 
        { height: 56, width: startWidth }, 
        { height: targetHeight, width: targetWidth, duration: 0.5, ease: "power3.inOut" }, 
        0
      );
      tl.fromTo(header, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.97, duration: 0.3, ease: "power2.in" }, 0);
      tl.fromTo(body, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.2);
    }

    // Change React class state underneath the forced inline GSAP transitions. 
    // This allows CSS 'is-active' features to apply without ruining our layout.
    setActiveId(targetId);
  };

  return (
    <section ref={sectionRef} className="acl-section" aria-label="Take a closer look at Apple Aether">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            
            <div className="heading-wrapper">
              <h2>Take a closer look at Aether.</h2>
            </div>

            <div ref={canvasRef} className="acl-canvas-wrapper">
              
              <div className="acl-images">
                <img 
                  ref={defaultImageRef}
                  src="https://raw.githubusercontent.com/web-enthusiast-prottoy/apple-aether/main/aether-webflow-sync/public/take-a-look/aether-closer-look-default.png" 
                  alt="Apple Aether" 
                  className="acl-image img-transparent img-default" 
                />
                {TABS.map((tab) => (
                  <img 
                    key={tab.id}
                    ref={(el) => { if (el) imageRefs.current[tab.id] = el; }}
                    src={tab.image} 
                    alt={tab.label} 
                    className={`acl-image ${tab.id === 'exterior' ? 'img-exterior' : ''} ${tab.isTransparent ? 'img-transparent' : ''}`} 
                  />
                ))}
              </div>

              <div className="acl-selector-wrap">
                  <nav className="acl-floating-selector" aria-label="Feature categories" role="tablist">
                    {TABS.map((tab) => {
                      const isActive = activeId === tab.id;
                      return (
                        <div 
                          key={tab.id} 
                          ref={(el) => { if (el) wrapperRefs.current[tab.id] = el; }}
                          className={`acl-pill-wrapper ${isActive ? "is-active" : ""}`}
                        >
                          <div className="acl-pill-absolute-container">
                            <button
                              ref={(el) => { if (el) headerRefs.current[tab.id] = el; }}
                              role="tab"
                              aria-selected={isActive}
                              aria-controls={`acl-panel-${tab.id}`}
                              id={`acl-tab-${tab.id}`}
                              className="acl-pill-header"
                              onClick={() => handleTabChange(tab.id)}
                            >
                              <TabIcon active={isActive} />
                              <span className="acl-pill__label">{tab.label}</span>
                            </button>
                            
                            <div 
                              ref={(el) => { if (el) bodyRefs.current[tab.id] = el; }}
                              className="acl-pill-body"
                              id={`acl-panel-${tab.id}`}
                              onClick={() => { if (isActive) handleTabChange(tab.id); }}
                            >
                              <strong>{tab.headline}</strong> {tab.body}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </nav>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
