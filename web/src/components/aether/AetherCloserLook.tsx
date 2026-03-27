"use client";

import { useEffect, useRef, useState } from "react";
import "./AetherCloserLook.css";

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
    image: "/take-a-look/aether-exterior.png",
    headline: "Seamless design.",
    body: "Apple Aether is sculpted as one continuous surface, with refined aerodynamics to help it reach an incredibly low drag coefficiency.",
    isTransparent: true
  },
  {
    id: "interior",
    label: "Interior",
    image: "/take-a-look/aether-interior.webp",
    headline: "Space, reimagined.",
    body: "A calm interior where controls appear only when needed, and every surface is designed to reduce noise, distraction, and effort.",
  },
  {
    id: "interface",
    label: "Interface",
    image: "/take-a-look/aether-interface.webp",
    headline: "The interface that waits.",
    body: "Voice, touch, gesture, and spatial controls work together so information appears at the right time, in the right place.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    image: "/take-a-look/aether-intelligence.webp",
    headline: "Intelligence, built in.",
    body: "Apple Aether continuously understands its surroundings, adapts to you, and works seamlessly across your Apple ecosystem.",
  },
  {
    id: "safety",
    label: "Safety",
    image: "/take-a-look/aether-safety.webp",
    headline: "Confidence everywhere.",
    body: "Advanced sensing and intelligent assistance help every drive feel more aware, more responsive, and more at ease.",
  },
  {
    id: "charging",
    label: "Charging",
    image: "/take-a-look/aether-charging.webp",
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
  const gsapRef = useRef<any>(null);

  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const defaultImageRef = useRef<HTMLImageElement>(null);
  
  // Refs for custom GSAP accordion
  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const bodyRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      gsapRef.current = gsap;
      
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
      
      if (defaultImageRef.current) {
        gsap.set(defaultImageRef.current, { opacity: 0, yPercent: -50, x: 250 });
        
        // Scroll entry from right
        gsap.to(defaultImageRef.current, {
          x: 0,
          opacity: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          }
        });
      }
      
      // Init Tabs: default height 56px, active content hidden
      TABS.forEach(tab => {
        const body = bodyRefs.current[tab.id];
        if (body) {
           gsap.set(body, { opacity: 0, scale: 0.95 });
        }
      });

    };
    init();
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
        // Clear inline GSAP width so CSS dynamically recalculates on window resizes
        if (activeId && wrapperRefs.current[activeId]) {
           gsap.set(wrapperRefs.current[activeId], { clearProps: "width" });
        }
        if (targetId && wrapperRefs.current[targetId]) {
           gsap.set(wrapperRefs.current[targetId], { clearProps: "width" });
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
      
      // Calculate specifically from responsive layout constraints (e.g. 280px mobile vs 320px desktop)
      const startWidth = wrapper.offsetWidth;
      const targetHeight = body ? body.offsetHeight : 120; 
      const targetWidth = body ? body.offsetWidth : 320;
      
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

            <div className="acl-canvas-wrapper">
              
              <div className="acl-images">
                <img 
                  ref={defaultImageRef}
                  src="/take-a-look/aether-closer-look-default.png" 
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
