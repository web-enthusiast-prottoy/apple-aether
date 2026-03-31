"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, OrbitControls, ContactShadows, PresentationControls, Stage } from "@react-three/drei";
import AetherCarModel from "./AetherCarModel";
import gsap from "gsap";

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
      opacity: 0.05,
      duration: 1,
      ease: "power2.out",
    });
  };

  useEffect(() => {
    // Only mount and render the 3D canvas when this section is actively visible
    // This entirely frees up the GPU WebGL thread for the rest of the site!
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInView(entry.isIntersecting);
        });
      },
      { rootMargin: "200px 0px" } // Pre-load slightly before scrolling into view to avoid compile stutters
    );

    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[100vh] bg-[#000000] overflow-hidden" id="design">
      {/* Dynamic faint background glow based on car color */}
      <div 
        ref={colorBgRef} 
        className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: currentColor.hex, opacity: 0.05 }}
      />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none flex flex-col justify-between py-24 px-12 sm:px-24">
        
        {/* Top Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-5xl sm:text-6xl text-white font-medium tracking-tight">
            Design your Aether.
          </h2>
        </div>

        {/* Bottom Color Picker */}
        <div className="flex flex-col items-center gap-8 pointer-events-auto">
          {/* Label */}
          <div className="flex flex-col items-center">
            <span className="text-white text-lg font-medium">{currentColor.name}</span>
            <span className="text-white/40 text-sm">Drag to rotate in 360°</span>
          </div>

          {/* Color Swatches */}
          <div className="flex gap-4 p-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => handleColorPick(c)}
                className={`w-10 h-10 rounded-full transition-all duration-300 relative focus:outline-none`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {/* Active Ring */}
                {currentColor.name === c.name && (
                  <span className="absolute -inset-1 border border-white/40 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Canvas - Lazily Mounted */}
      <div className="absolute inset-0 z-[5]">
        {inView && (
          <Canvas shadows dpr={dpr as [number, number]} camera={{ position: [4, 1.5, 6], fov: 35 }}>
            <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 2])}>
              <Suspense fallback={null}>
                <PresentationControls 
                  speed={1.5} 
                  global 
                  zoom={0.8} 
                  polar={[-0.1, Math.PI / 8]} // Limit vertical rotation
                  azimuth={[-Infinity, Infinity]} // Allow full 360 horizontal rotation
                >
                  {/* Stage stripped down to bare minimum to show only textures */}
                  <Stage environment="city" intensity={0} shadows={false}>
                    <AetherCarModel color={currentColor.value} />
                  </Stage>
                </PresentationControls>

                {/* High quality static contact shadow beneath the car, baked once for performance! */}
                <ContactShadows resolution={512} frames={1} scale={20} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -0.05, 0]} />
              </Suspense>
            </PerformanceMonitor>
          </Canvas>
        )}
      </div>
    </section>
  );
}
