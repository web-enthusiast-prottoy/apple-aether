"use client";

import { useEffect, useRef, useState } from "react";
import "./AetherHighlights.css";

const SLIDES = [
  {
    id: 1,
    image: "/aether-highlights/aether-slide-1.webp",
    headline: "Designed to move everything forward.",
    body: "Apple Aether brings electric performance, intelligent control, and a new sense of calm to the road.",
  },
  {
    id: 2,
    image: "/aether-highlights/aether-slide-2.webp",
    headline: "Go farther between moments.",
    body: "Up to 720 km of all-electric driving, so the day keeps going.",
  },
  {
    id: 3,
    image: "/aether-highlights/aether-slide-3.webp",
    headline: "A cabin that clears the noise.",
    body: "Controls appear only when you need them, creating a quieter, more intuitive driving experience.",
  },
  {
    id: 4,
    image: "/aether-highlights/aether-slide-4.webp",
    headline: "Awareness, built in.",
    body: "Advanced sensing, intelligent assistance, and seamless Apple ecosystem integration help every drive feel more effortless.",
  },
];

// GSAP gap and width configs
const CARD_GAP = 16;
const PADDING_OFFSET = 0.05; // 5% padding on mobile wrapper, although we scale width dynamically

export default function AetherHighlights() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP animation references
  const [gsapReady, setGsapReady] = useState(false);
  const progressTlRef = useRef<any>(null);
  const gsapRef = useRef<any>(null);
  const dotProgressRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Measure card sizes
  const [cardWidth, setCardWidth] = useState(0);

  // In-view detection
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Calculate active card width
      if (cardsRef.current[0]) {
        setCardWidth(cardsRef.current[0].offsetWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // 1. Initialize GSAP on mount
    let ctx: any; // gsap context
    
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      gsapRef.current = gsap;
      
      ctx = gsap.context(() => {
        // Initial setup for cards is handled by CSS mostly, but we define defaults
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          const img = card.querySelector(".ahl-card__image");
          if (i !== 0) {
            // Unselected cards scale down slightly on setup
            gsap.set(card, { scale: 0.95, opacity: 0.6 });
            if (img) gsap.set(img, { scale: 1.15, xPercent: i > 0 ? -5 : 5 });
          } else {
            gsap.set(card, { scale: 1, opacity: 1 });
            if (img) gsap.set(img, { scale: 1, xPercent: 0 });
          }
        });
      }, sectionRef);
      
      setGsapReady(true);
    };

    initGSAP();

    // Intersection Observer to start autoplay only when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 } // Trigger when 15% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      if (ctx) ctx.revert();
    };
  }, []);

  // 2. Handle Slide Transitions
  useEffect(() => {
    const gsap = gsapRef.current;
    if (!gsap || !gsapReady || !trackRef.current || cardWidth === 0) return;

    // The shift logic is slightly tricky:
    // When cardWidth moves, it's (cardWidth + CARD_GAP) * index
    const xOffset = -(cardWidth + CARD_GAP) * activeIndex;

    gsap.to(trackRef.current, {
      x: xOffset,
      duration: 1.2,
      ease: "power4.out",
    });

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const isActive = i === activeIndex;

      // Animate card scale/opacity based on active/inactive
      gsap.to(card, {
        scale: isActive ? 1 : 0.95,
        opacity: isActive ? 1 : 0.5,
        duration: 1.2,
        ease: "power3.inOut",
      });

      // Image pan effect without exposing background
      const img = card.querySelector(".ahl-card__image");
      if (img) {
        gsap.to(img, {
          xPercent: isActive ? 0 : (i > activeIndex ? -5 : 5),
          scale: isActive ? 1 : 1.15,
          duration: 1.2,
          ease: "power3.inOut",
        });
      }

      // Stagger text on active
      const textNodes = card.querySelectorAll(".ahl-card__content > *");
      if (textNodes.length) {
        if (isActive) {
          gsap.fromTo(
            textNodes,
            { y: 30, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
            {
              y: 0,
              opacity: 1,
              clipPath: "inset(0% 0% -20% 0%)",
              duration: 1,
              stagger: 0.15,
              ease: "power4.out",
              delay: 0.3, // wait for slide
              overwrite: "auto",
            }
          );
        } else {
          gsap.to(textNodes, {
            y: -15,
            opacity: 0,
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.5,
            ease: "power3.in",
            overwrite: "auto",
          });
        }
      }
    });
  }, [activeIndex, cardWidth, gsapReady]);

  // 3. Autoplay logic & Progress Bar
  useEffect(() => {
    const gsap = gsapRef.current;
    if (!gsap || !gsapReady) return;

    if (progressTlRef.current) {
      progressTlRef.current.kill();
    }

    // Reset all progress bars
    gsap.set(dotProgressRefs.current, { width: "0%" });

    // Ensure DOM is ready for the active progress reference
    const activeProgress = dotProgressRefs.current[activeIndex];
    
    if (activeProgress) {
      progressTlRef.current = gsap.to(activeProgress, {
        width: "100%",
        duration: 6,
        ease: "none",
        onComplete: () => {
          setActiveIndex((prev) => (prev + 1) % SLIDES.length);
        },
      });

      if (!isPlaying || !inView) {
        progressTlRef.current.pause();
      }
    }

    return () => {
      if (progressTlRef.current) progressTlRef.current.kill();
    };
  }, [activeIndex, gsapReady, inView]);

  // Handle Play/Pause explicit toggle
  useEffect(() => {
    if (progressTlRef.current) {
      if (isPlaying && inView) {
        progressTlRef.current.play();
      } else {
        progressTlRef.current.pause();
      }
    }
  }, [isPlaying, inView]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    if (!isPlaying) setIsPlaying(true); // resume play on manual interaction
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section ref={sectionRef} className="ahl-section" aria-label="Apple Aether Highlights">
      <div className="ahl-heading">
        <h2>Get the highlights.</h2>
      </div>

      <div className="ahl-track-wrap">
        <div ref={trackRef} className="ahl-track">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="ahl-card"
              style={{ marginRight: i < SLIDES.length - 1 ? `${CARD_GAP}px` : "0px" }}
              role="group"
              aria-label={`Highlight ${i + 1} of ${SLIDES.length}`}
            >
              <img src={slide.image} alt={slide.headline} className="ahl-card__image" loading={i === 0 ? "eager" : "lazy"} />
              <div className="ahl-card__overlay" aria-hidden="true" />
              
              <div className="ahl-card__content">
                <h3 className="ahl-card__headline">{slide.headline}</h3>
                <p className="ahl-card__body">{slide.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Container */}
      <div className="ahl-controls">
        <div className="ahl-dots" role="tablist">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Slide ${i + 1}`}
              className={`ahl-dot ${i === activeIndex ? "ahl-dot--active" : ""}`}
              onClick={() => handleDotClick(i)}
            >
              <span
                ref={(el) => {
                  dotProgressRefs.current[i] = el;
                }}
                className="ahl-dot-progress"
                aria-hidden="true"
              />
              <span className="sr-only">Slide {i + 1}</span>
            </button>
          ))}
        </div>
        <button
          className="ahl-play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause highlights" : "Play highlights"}
        >
          {isPlaying ? (
            // Pause Icon
            <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 2v10m6-10v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            // Play Icon
            <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "2px" }}>
              <path d="M12.5 7L3 1.5v11L12.5 7z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
