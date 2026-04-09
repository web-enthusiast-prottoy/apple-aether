
import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, PresentationControls, Stage } from "@react-three/drei";
import AetherCarModel from "./AetherCarModel";
import "./Aether3DConfigurator.css";

const gsap = (window as any).gsap;

const COLORS = [
  { name: "Obsidian Black", value: "#0A0A0A", hex: "#1A1A1A" },
  { name: "Titanium Silver", value: "#A9ACB1", hex: "#CCCCCC" },
  { name: "Ceramic White", value: "#F5F5F7", hex: "#F5F5F7" },
  { name: "Crimson Red", value: "#8A0303", hex: "#BF0A0A" },
  { name: "Product Blue", value: "#041C33", hex: "#063259" },
];

export default function Aether3DConfigurator() {
  const [currentColor, setCurrentColor] = useState(COLORS[1]);
  const [dpr, setDpr] = useState([1, 2]); // allow reducing DPR on lag
  const [inView, setInView] = useState(false);
  const colorBgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  // A handler to morph the background overlay slightly when a color is picked
  const handleColorPick = (colorObj: typeof COLORS[0]) => {
    setCurrentColor(colorObj);
    gsap.to(colorBgRef.current, {
      backgroundColor: colorObj.hex,
      opacity: 0.1, // slightly higher opacity for better visibility
      duration: 1.2,
      ease: "power2.out",
    });
  };

  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    // Only mount and render the 3D canvas when this section is actively visible
    // This entirely frees up the GPU WebGL thread for the rest of the site!
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting) setHasBeenInView(true);
        });
      },
      { rootMargin: "400px" } // Pre-load 400px before it enters the viewport
    );

    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="config-section" id="design">
      {/* Dynamic faint background glow based on car color */}
      <div 
        ref={colorBgRef} 
        className="config-bg-glow"
        style={{ backgroundColor: currentColor.hex, opacity: 0.08 }}
      />
      
      {/* UI Overlay */}
      <div className="config-ui-overlay">
        
        {/* Top Header */}
        <div className="config-header">
          <h2 className="config-title">Design your Aether.</h2>
        </div>

        {/* Bottom Color Picker */}
        <div className="config-bottom-controls">
          {/* Label and Hint - clearly separated */}
          <div className="config-label-group">
            <span className="config-color-name">{currentColor.name}</span>
            <span className="sr-only">—</span> {/* hidden separator for screen readers */}
            <span className="config-drag-hint">Drag to rotate in 360°</span>
          </div>

          {/* Color Swatches */}
          <div className="config-swatches-wrap">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => handleColorPick(c)}
                className={`config-swatch ${currentColor.name === c.name ? "config-swatch--active" : ""}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3D Canvas - Persistent once loaded */}
      <div className="config-canvas-container" style={{ transform: "scale(0.99) translateY(-5%)" }}>
        {hasBeenInView && (
          <Canvas 
            shadows 
            dpr={dpr as [number, number]} 
            camera={{ position: [4, 1.5, 6], fov: 32 }}
            // Use 'demand' or 'never' when not in view to save GPU cycles without unmounting
            frameloop={inView ? "always" : "demand"}
          >
            <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 2])}>
              <Suspense fallback={null}>
                <PresentationControls 
                  speed={2} 
                  global 
                  zoom={0.8} 
                  polar={[-0.1, Math.PI / 8]} 
                  azimuth={[-Infinity, Infinity]} 
                >
                  <Stage environment="city" intensity={0.6} shadows={false}>
                    <AetherCarModel color={currentColor.value} />
                  </Stage>
                </PresentationControls>
              </Suspense>
            </PerformanceMonitor>
          </Canvas>
        )}
      </div>

    </section>
  );
}
