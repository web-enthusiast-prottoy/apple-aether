"use client";

import { useEffect, useRef, useState } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Map each color value (from Aether3DConfigurator) to its texture file
const COLOR_TEXTURE_MAP: Record<string, string> = {
  "#0A0A0A": "/aether-3d/aether-3d-texture-black.png",
  "#A9ACB1": "/aether-3d/aether-3d-texture-gray.png",
  "#F5F5F7": "/aether-3d/aether-3d-texture-white.png",
  "#8A0303": "/aether-3d/aether-3d-texture-red.png",
  "#041C33": "/aether-3d/aether-3d-texture-blue.png",
};

const FADE_DURATION = 0.6; // seconds for crossfade

function buildMaterial(texture: THREE.Texture): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    map: texture,
    // "Textures only" mode — removes all procedural paint effects
    metalness: 0,
    roughness: 1,
    clearcoat: 0,
    envMapIntensity: 0,
    transparent: true,
    opacity: 1,
  });
  return mat;
}

function prepTexture(tex: THREE.Texture): THREE.Texture {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.needsUpdate = true;
  return tex;
}

export default function AetherCarModel({ color }: { color: string }) {
  const { scene } = useGLTF("/aether-3d/aether-3d-4.glb");

  // Pre-load all 5 textures up-front for instant swaps
  const [tBlack, tGray, tWhite, tRed, tBlue] = useTexture([
    "/aether-3d/aether-3d-texture-black.png",
    "/aether-3d/aether-3d-texture-gray.png",
    "/aether-3d/aether-3d-texture-white.png",
    "/aether-3d/aether-3d-texture-red.png",
    "/aether-3d/aether-3d-texture-blue.png",
  ]);

  const textureMap = useRef<Record<string, THREE.Texture>>({});

  // References for "A" and "B" layer materials (crossfade pair)
  const matA = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const matB = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // Fade progress: 0 = A fully visible, 1 = B fully visible
  const fadeProgress = useRef(1); // Start at 1 so first color applies instantly
  const isFading = useRef(false);
  const [initialized, setInitialized] = useState(false);

  // Build texture lookup once textures are ready
  useEffect(() => {
    textureMap.current = {
      "#0A0A0A": prepTexture(tBlack),
      "#A9ACB1": prepTexture(tGray),
      "#F5F5F7": prepTexture(tWhite),
      "#8A0303": prepTexture(tRed),
      "#041C33": prepTexture(tBlue),
    };

    const initialTex = textureMap.current[color] ?? prepTexture(tGray);

    matA.current = buildMaterial(initialTex);
    matB.current = buildMaterial(initialTex);
    matA.current.opacity = 1;
    matB.current.opacity = 0;

    // Apply both materials — we'll toggle between them per mesh
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals();
        }
        // Each mesh holds both materials; we render A on top, B fades in underneath
        mesh.material = matA.current!;
      }
    });

    setInitialized(true);
  }, [scene, tBlack, tGray, tWhite, tRed, tBlue]);

  // Trigger crossfade when color changes
  useEffect(() => {
    if (!initialized || !matA.current || !matB.current) return;

    const nextTex = textureMap.current[color] ?? textureMap.current["#A9ACB1"];

    // Load the incoming texture into B
    matB.current.map = nextTex;
    matB.current.opacity = 0;
    matB.current.needsUpdate = true;

    // Switch all meshes to render B on-top
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = matB.current!;
      }
    });

    fadeProgress.current = 0;
    isFading.current = true;
  }, [color, initialized]);

  // Animate the crossfade on each frame
  useFrame((_, delta) => {
    if (!isFading.current || !matA.current || !matB.current) return;

    fadeProgress.current = Math.min(fadeProgress.current + delta / FADE_DURATION, 1);

    // B fades in (new texture)
    matB.current.opacity = fadeProgress.current;
    // A fades out (old texture)
    matA.current.opacity = 1 - fadeProgress.current;

    if (fadeProgress.current >= 1) {
      // Fade complete — swap roles: B becomes the new "stable" A
      isFading.current = false;
      matA.current.map = matB.current.map;
      matA.current.opacity = 1;
      matA.current.needsUpdate = true;
      matB.current.opacity = 0;

      // Return meshes to matA
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = matA.current!;
        }
      });
    }
  });

  return (
    <group scale={[0.025, 0.025, 0.025]} position={[0, -0.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// Pre-warm all assets on page load
useGLTF.preload("/aether-3d/aether-3d-4.glb");
useTexture.preload("/aether-3d/aether-3d-texture-black.png");
useTexture.preload("/aether-3d/aether-3d-texture-gray.png");
useTexture.preload("/aether-3d/aether-3d-texture-white.png");
useTexture.preload("/aether-3d/aether-3d-texture-red.png");
useTexture.preload("/aether-3d/aether-3d-texture-blue.png");
