"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface DetectedObject {
	id: string;
	type: "pedestrian" | "vehicle";
	distance: number;
	position: "left" | "center" | "right";
}

export default function AetherIphoneDrive() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [speed, setSpeed] = useState(0);
	const [steering, setSteering] = useState(0);
	const [isBoosting, setIsBoosting] = useState(false);
	const [distance, setDistance] = useState(0);
	const [accidentsSaved, setAccidentsSaved] = useState(0);
	const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>(
		[],
	);
	const [laneWarning, setLaneWarning] = useState<{
		show: boolean;
		direction: "left" | "right" | null;
		braking: boolean;
	}>({ show: false, direction: null, braking: false });
	const [isInView, setIsInView] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadProgress, setLoadProgress] = useState(0);
	const [isHovering, setIsHovering] = useState(false);

	const cursorRef = useRef<HTMLDivElement>(null);
	const cursorGlowRef = useRef<HTMLDivElement>(null);

	// ── Intersection Observer ──────────────────────────────────────────
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInView(entry.isIntersecting);
			},
			{ threshold: 0.1 },
		);

		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	// ── Main Controller ───────────────────────────────────────────────
	useEffect(() => {
		if (!isInView || !containerRef.current) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsLoading(true);
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setLoadProgress(0);
			return;
		}

		// Initializing sequence
		let progressInterval: NodeJS.Timeout;
		let carModel: any = null;
		const startLoading = () => {
			let p = 0;
			progressInterval = setInterval(() => {
				p += Math.random() * 8;
				if (p >= 100) {
					p = 100;
					clearInterval(progressInterval);
					setTimeout(() => setIsLoading(false), 500);
				}
				setLoadProgress(p);
			}, 100);
		};
		startLoading();

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x080c12);
		scene.fog = new THREE.Fog(0x080c12, 60, 300);

		const containerWidth = containerRef.current.offsetWidth;
		const containerHeight = containerRef.current.offsetHeight;

		const camera = new THREE.PerspectiveCamera(
			60,
			containerWidth / containerHeight,
			0.1,
			400,
		);
		camera.position.set(0, 4, -10);
		camera.lookAt(0, 1.5, 20);

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(containerWidth, containerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.BasicShadowMap;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.2;
		containerRef.current.appendChild(renderer.domElement);

		// Lighting - Ultra-bright high-key night aesthetic
		const ambientLight = new THREE.AmbientLight(0x8899aa, 2.4);
		scene.add(ambientLight);

		const moonLight = new THREE.DirectionalLight(0xc0d4ff, 1.2);
		moonLight.position.set(50, 60, 50);
		scene.add(moonLight);

		const cityGlow = new THREE.HemisphereLight(0x5566aa, 0x886040, 0.8);
		scene.add(cityGlow);

		// Stars
		const starsGeometry = new THREE.BufferGeometry();
		const starsCount = 1000;
		const starsPositions = new Float32Array(starsCount * 3);
		for (let i = 0; i < starsCount; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.random() * Math.PI * 0.4;
			const radius = 180 + Math.random() * 60;
			starsPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
			starsPositions[i * 3 + 1] = radius * Math.cos(phi) + 40;
			starsPositions[i * 3 + 2] =
				radius * Math.sin(phi) * Math.sin(theta);
		}
		starsGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(starsPositions, 3),
		);
		const stars = new THREE.Points(
			starsGeometry,
			new THREE.PointsMaterial({
				color: 0xffffff,
				size: 0.25,
				transparent: true,
				opacity: 0.7,
			}),
		);
		scene.add(stars);

		// Moon
		const moon = new THREE.Mesh(
			new THREE.SphereGeometry(10, 24, 24),
			new THREE.MeshBasicMaterial({ color: 0xffffee }),
		);
		moon.position.set(80, 70, 180);
		scene.add(moon);
		const moonGlow = new THREE.Mesh(
			new THREE.SphereGeometry(16, 24, 24),
			new THREE.MeshBasicMaterial({
				color: 0xffffdd,
				transparent: true,
				opacity: 0.12,
			}),
		);
		// Thunder & Lightning Bolt
		const thunderLight = new THREE.DirectionalLight(0xffffff, 0);
		thunderLight.position.set(20, 100, 20);
		scene.add(thunderLight);
		let thunderTimer = 0;

		const createLightningBolt = () => {
			const pts = [];
			const curr = new THREE.Vector3(
				(Math.random() - 0.5) * 60,
				100,
				100 + Math.random() * 50,
			);
			for (let i = 0; i < 12; i++) {
				pts.push(curr.clone());
				curr.add(
					new THREE.Vector3(
						(Math.random() - 0.5) * 15,
						-8 - Math.random() * 4,
						(Math.random() - 0.5) * 10,
					),
				);
			}
			return new THREE.BufferGeometry().setFromPoints(pts);
		};
		const lightningMat = new THREE.LineBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 1.0,
			linewidth: 2,
		});
		const lightningBolt = new THREE.Line(
			createLightningBolt(),
			lightningMat,
		);
		scene.add(lightningBolt);
		lightningBolt.visible = false;

		// Secondary glow bolt (thicker, more visible)
		const lightningGlowMat = new THREE.LineBasicMaterial({
			color: 0xaaddff,
			transparent: true,
			opacity: 0.5,
		});
		const lightningGlow = new THREE.Line(
			createLightningBolt(),
			lightningGlowMat,
		);
		scene.add(lightningGlow);
		lightningGlow.visible = false;

		let thunderFlashPhase = 0; // 0 = idle, 1 = flashing, 2 = fading
		let thunderFlashTimer = 0;
		let thunderFlashCount = 0;
		let thunderCooldown = 25 + Math.random() * 35; // seconds before next possible strike

		// Sky dome — animated gradient (replaces flat scene.background for depth)
		const skyDomeGeo = new THREE.SphereGeometry(350, 32, 16);
		const skyDomeMat = new THREE.ShaderMaterial({
			side: THREE.BackSide,
			depthWrite: false,
			uniforms: {
				topColor: { value: new THREE.Color(0x04080f) },
				midColor: { value: new THREE.Color(0x0a1628) },
				horizColor: { value: new THREE.Color(0x111c30) },
				fogColor: { value: new THREE.Color(0x08090e) },
			},
			vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
			fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 horizColor;
        uniform vec3 fogColor;
        varying vec3 vWorldPos;
        void main() {
          float h = normalize(vWorldPos).y; // -1 to 1
          vec3 col;
          if (h > 0.15) {
            col = mix(midColor, topColor, smoothstep(0.15, 0.6, h));
          } else if (h > -0.05) {
            col = mix(horizColor, midColor, smoothstep(-0.05, 0.15, h));
          } else {
            col = mix(fogColor, horizColor, smoothstep(-0.3, -0.05, h));
          }
          gl_FragColor = vec4(col, 1.0);
        }`,
		});
		const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
		scene.add(skyDome);

		// Ground — canvas-painted sidewalk/dirt texture
		const createGroundTexture = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 256;
			canvas.height = 256;
			const ctx = canvas.getContext("2d")!;
			ctx.fillStyle = "#1c1c22";
			ctx.fillRect(0, 0, 256, 256);
			// Tile grid (sidewalk panels)
			ctx.strokeStyle = "rgba(255,255,255,0.06)";
			ctx.lineWidth = 1;
			for (let x = 0; x < 256; x += 28) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, 256);
				ctx.stroke();
			}
			for (let y = 0; y < 256; y += 28) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(256, y);
				ctx.stroke();
			}
			// Stain patches
			for (let i = 0; i < 18; i++) {
				const gx = Math.random() * 256,
					gy = Math.random() * 256,
					gr = 6 + Math.random() * 18;
				const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
				g.addColorStop(0, "rgba(0,0,0,0.18)");
				g.addColorStop(1, "rgba(0,0,0,0)");
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(gx, gy, gr, 0, Math.PI * 2);
				ctx.fill();
			}
			// Subtle grain
			for (let i = 0; i < 3000; i++) {
				const v = Math.random() > 0.5 ? 8 : -8;
				ctx.fillStyle = `rgba(${128 + v},${128 + v},${136 + v},0.04)`;
				ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
			}
			const t = new THREE.CanvasTexture(canvas);
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
			t.repeat.set(12, 15);
			return t;
		};
		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry(400, 500),
			new THREE.MeshLambertMaterial({
				map: createGroundTexture(),
				color: 0xffffff,
			}),
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.z = 150;
		ground.receiveShadow = true;
		scene.add(ground);

		// Road (Main Highway) — canvas asphalt texture
		const createRoadTexture = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 256;
			canvas.height = 512;
			const ctx = canvas.getContext("2d")!;
			// Base asphalt
			ctx.fillStyle = "#28282e";
			ctx.fillRect(0, 0, 256, 512);
			// Asphalt grain noise
			for (let i = 0; i < 12000; i++) {
				const bv = (Math.random() - 0.5) * 14;
				const b = (40 + bv) | 0;
				ctx.fillStyle = `rgba(${b},${b},${b + 3},0.18)`;
				ctx.fillRect(
					Math.random() * 256,
					Math.random() * 512,
					Math.random() < 0.7 ? 1 : 2,
					Math.random() < 0.7 ? 1 : 2,
				);
			}
			// Longitudinal cracks
			for (let c = 0; c < 6; c++) {
				ctx.strokeStyle = `rgba(${(60 + Math.random() * 20) | 0},${(60 + Math.random() * 20) | 0},${(70 + Math.random() * 15) | 0},0.25)`;
				ctx.lineWidth = 0.4 + Math.random() * 0.6;
				ctx.beginPath();
				let cx2 = Math.random() * 256,
					cy2 = Math.random() * 512;
				ctx.moveTo(cx2, cy2);
				for (let s = 0; s < 6; s++) {
					cx2 += (Math.random() - 0.5) * 20;
					cy2 += 25 + Math.random() * 30;
					ctx.lineTo(cx2, cy2);
				}
				ctx.stroke();
			}
			// Wet-road gloss strips along center
			const shine = ctx.createLinearGradient(0, 0, 256, 0);
			shine.addColorStop(0, "rgba(80,100,140,0)");
			shine.addColorStop(0.45, "rgba(80,100,140,0.09)");
			shine.addColorStop(0.55, "rgba(80,100,140,0.09)");
			shine.addColorStop(1, "rgba(80,100,140,0)");
			ctx.fillStyle = shine;
			ctx.fillRect(0, 0, 256, 512);
			const t = new THREE.CanvasTexture(canvas);
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
			t.repeat.set(1, 8);
			return t;
		};
		const road = new THREE.Mesh(
			new THREE.PlaneGeometry(14, 500),
			new THREE.MeshLambertMaterial({
				map: createRoadTexture(),
				color: 0xffffff,
			}),
		);
		road.rotation.x = -Math.PI / 2;
		road.position.set(0, 0.01, 150);
		road.receiveShadow = true;
		scene.add(road);

		// Intersections (Cross roads)
		const intersections: THREE.Group[] = [];
		for (let z = 100; z < 550; z += 150) {
			const g = new THREE.Group();
			const cross = new THREE.Mesh(
				new THREE.PlaneGeometry(120, 14),
				new THREE.MeshLambertMaterial({ color: 0x2a2a32 }),
			);
			cross.rotation.x = -Math.PI / 2;
			g.add(cross);
			// Dashed lane for side road (horizontal)
			for (let x = -60; x < 60; x += 10) {
				if (Math.abs(x) < 8) continue; // Clear space for main highway
				const dash = new THREE.Mesh(
					new THREE.PlaneGeometry(4, 0.15),
					new THREE.MeshBasicMaterial({ color: 0xcccccc }),
				);
				dash.rotation.x = -Math.PI / 2;
				dash.position.set(x, 0.01, 0);
				g.add(dash);
			}
			g.position.set(0, 0.005, z);
			scene.add(g);
			intersections.push(g);
		}

		// Lane markings
		const laneGroup = new THREE.Group();
		scene.add(laneGroup);
		for (let z = -20; z < 300; z += 12) {
			// Main road dash
			const dash = new THREE.Mesh(
				new THREE.PlaneGeometry(0.2, 4),
				new THREE.MeshBasicMaterial({ color: 0xffffff }),
			);
			dash.rotation.x = -Math.PI / 2;
			dash.position.set(0, 0.02, z);
			laneGroup.add(dash);
		}

		// Road edges
		const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
		const leftEdge = new THREE.Mesh(
			new THREE.PlaneGeometry(0.15, 500),
			edgeMat,
		);
		leftEdge.rotation.x = -Math.PI / 2;
		leftEdge.position.set(-6.5, 0.02, 150);
		scene.add(leftEdge);
		const rightEdge = new THREE.Mesh(
			new THREE.PlaneGeometry(0.15, 500),
			edgeMat.clone(),
		);
		rightEdge.rotation.x = -Math.PI / 2;
		rightEdge.position.set(6.5, 0.02, 150);
		scene.add(rightEdge);

		// LED strips (Main Road)
		const ledMat = new THREE.MeshBasicMaterial({
			color: 0x4488aa,
			transparent: true,
			opacity: 0.55,
		});
		const leftLed = new THREE.Mesh(
			new THREE.PlaneGeometry(0.06, 500),
			ledMat,
		);
		leftLed.rotation.x = -Math.PI / 2;
		leftLed.position.set(-6.7, 0.03, 150);
		scene.add(leftLed);
		const rightLed = new THREE.Mesh(
			new THREE.PlaneGeometry(0.06, 500),
			ledMat.clone(),
		);
		rightLed.rotation.x = -Math.PI / 2;
		rightLed.position.set(6.7, 0.03, 150);
		scene.add(rightLed);

		// ── DIRECTION ARROWS — beautiful Apple-style road chevrons ──────────
		// Flat chevron/arrow lying on the road surface.
		// The arrow body points in LOCAL +X (right). We rotate the group around Y
		// to point it LEFT (rotation.y = Math.PI) or RIGHT (rotation.y = 0).
		// Then the whole group is tilted -PI/2 around X to lay flat on the road.
		//
		// World orientation after laying flat:
		//   - Arrow points in +X world = RIGHT on screen (camera looks toward -Z)
		//   - Rotating Y by PI flips it to point LEFT on screen
		//
		// Verified: dodgeDir 'right' → rotation.y = 0 → points RIGHT ✓
		//           dodgeDir 'left'  → rotation.y = PI → points LEFT ✓

		const arrowPool: THREE.Group[] = [];

		const createArrowMesh = () => {
			const arrowGroup = new THREE.Group();

			// ── Classic Road-Paint Navigation Arrow ─────────────────────────
			// Premium, thick road-marking aesthetic.
			const mat = new THREE.MeshBasicMaterial({
				color: 0xe8f4ff,
				transparent: true,
				opacity: 0.0,
				depthWrite: false,
				side: THREE.DoubleSide,
			});

			// Stem (Rectangle)
			const stemGeo = new THREE.BufferGeometry();
			stemGeo.setAttribute(
				"position",
				new THREE.BufferAttribute(
					new Float32Array([
						-1.2, 0, 0.19, 0.3, 0, 0.19, 0.3, 0, -0.19, -1.2, 0,
						-0.19,
					]),
					3,
				),
			);
			stemGeo.setIndex([0, 1, 2, 0, 2, 3]);
			arrowGroup.add(new THREE.Mesh(stemGeo, mat.clone()));

			// Arrowhead (Triangle)
			const headGeo = new THREE.BufferGeometry();
			headGeo.setAttribute(
				"position",
				new THREE.BufferAttribute(
					new Float32Array([
						1.3, 0, 0.0, 0.3, 0, 0.72, 0.3, 0, -0.72,
					]),
					3,
				),
			);
			headGeo.setIndex([0, 1, 2]);
			arrowGroup.add(new THREE.Mesh(headGeo, mat.clone()));

			arrowGroup.visible = false;
			return arrowGroup;
		};

		// Pool of 5 arrows
		for (let i = 0; i < 5; i++) {
			const arrow = createArrowMesh();
			scene.add(arrow);
			arrowPool.push(arrow);
		}

		// ─────────────────────────────────────────────────────────────────

		const buildings: THREE.Object3D[] = [];
		const trees: THREE.Group[] = [];
		const cacti: THREE.Group[] = [];
		const pedestrians: THREE.Group[] = [];
		const trafficCars: THREE.Group[] = [];
		const restaurants: THREE.Group[] = [];
		const lamps: THREE.Group[] = [];
		const mountains: THREE.Mesh[] = [];
		const beachItems: THREE.Group[] = [];
		const palmTrees: THREE.Group[] = [];
		const dunes: THREE.Group[] = [];
		const rocks: THREE.Mesh[] = [];
		const clouds: THREE.Group[] = [];
		const scanBoxes: THREE.Group[] = [];

		// Scan Beam (Subtle LiDAR Pulse)
		const scanBeamGroup = new THREE.Group();

		// Removed the cone entirely as requested for a cleaner look.
		const scanGridGeo = new THREE.PlaneGeometry(80, 100, 40, 50);
		const scanGridMat = new THREE.ShaderMaterial({
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			// Apple: minimalist data-grid — high-frequency lines that feel high-res
			uniforms: {
				time: { value: 0 },
				color: { value: new THREE.Color(0x60a5fa) },
			},
			vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
			fragmentShader: `
        uniform float time; uniform vec3 color; varying vec2 vUv;
        void main() {
          vec2 gridUv = fract(vUv * vec2(20.0, 25.0) - vec2(0.0, time * 0.8));
          float gridLines = smoothstep(0.97, 1.0, max(gridUv.x, gridUv.y));
          
          // Data pulse ripple
          float pulse = 1.0 - fract(vUv.y * 4.0 - time * 1.2);
          pulse = smoothstep(0.8, 1.0, pulse) * 0.4;
          
          float fade = 1.0 - smoothstep(0.0, 0.6, abs(vUv.x - 0.5));
          fade *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
          
          float alpha = (gridLines * 0.075 + pulse * 0.5) * fade;
          gl_FragColor = vec4(color, alpha);
        }`,
		});
		const scanGrid = new THREE.Mesh(scanGridGeo, scanGridMat);
		scanGrid.rotation.x = -Math.PI / 2;
		scanGrid.position.set(0, 0.08, 55);
		scanBeamGroup.add(scanGrid);
		scene.add(scanBeamGroup);

		// Scan boxes
		const createScanBox = (
			width: number,
			height: number,
			isPedestrian: boolean,
		) => {
			const boxGroup = new THREE.Group();
			const color = isPedestrian ? 0x00ffff : 0x00aaff; // Neon Sci-Fi Blue/Cyan
			const bracketMat = new THREE.MeshBasicMaterial({
				color,
				transparent: true,
				opacity: 0.2,
				blending: THREE.AdditiveBlending,
			});
			const bracketSize = Math.min(width, height) * 0.4;
			const bracketThick = 0.05;

			const createBracket = (cornerX: number, cornerY: number) => {
				const bracket = new THREE.Group();
				const hLine = new THREE.Mesh(
					new THREE.BoxGeometry(
						bracketSize,
						bracketThick,
						bracketThick,
					),
					bracketMat,
				);
				hLine.position.x = (cornerX * bracketSize) / 2;
				bracket.add(hLine);
				const vLine = new THREE.Mesh(
					new THREE.BoxGeometry(
						bracketThick,
						bracketSize,
						bracketThick,
					),
					bracketMat,
				);
				vLine.position.y = (cornerY * bracketSize) / 2;
				bracket.add(vLine);
				bracket.position.set(
					cornerX * (width / 2),
					cornerY * (height / 2),
					0,
				);
				return bracket;
			};
			boxGroup.add(createBracket(-1, 1));
			boxGroup.add(createBracket(1, 1));
			boxGroup.add(createBracket(-1, -1));
			boxGroup.add(createBracket(1, -1));

			// Holographic Scanned Surface
			const scanFillMat = new THREE.ShaderMaterial({
				transparent: true,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				uniforms: {
					time: { value: 0 },
					color: { value: new THREE.Color(color) },
				},
				vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
				fragmentShader: `
          uniform float time; uniform vec3 color; varying vec2 vUv;
          void main() {
            // Moving scan lines
            float scan = sin(vUv.y * 30.0 + time * 15.0) * 0.2 + 0.2;
            // Vertical pulse
            float pulse = smoothstep(0.45, 0.5, abs(fract(vUv.y - time * 0.8) - 0.5));
            // Grid
            vec2 grid = fract(vUv * 15.0);
            float lines = smoothstep(0.95, 1.0, max(grid.x, grid.y));
            float alpha = (scan + pulse * 4.0 + lines * 0.8) * 0.06; // Decreased opacity by 2x
            gl_FragColor = vec4(color, alpha);
          }`,
			});
			const fill = new THREE.Mesh(
				new THREE.PlaneGeometry(width, height),
				scanFillMat,
			);
			boxGroup.add(fill);
			boxGroup.userData.fill = fill;

			// Laser Sweep Line
			const laserMat = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: 1.0,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
			});
			const laser = new THREE.Mesh(
				new THREE.PlaneGeometry(width * 1.3, 0.12),
				laserMat,
			);
			boxGroup.add(laser);
			boxGroup.userData.laser = laser;

			// Identification Tag (Small box on the side)
			const tag = new THREE.Mesh(
				new THREE.PlaneGeometry(0.8, 0.2),
				new THREE.MeshBasicMaterial({
					color,
					transparent: true,
					opacity: 0.6,
					side: THREE.DoubleSide,
				}),
			);
			tag.position.set(width / 2 + 0.5, height / 2, 0);
			boxGroup.add(tag);
			boxGroup.userData.tag = tag;

			const dotMat = new THREE.MeshBasicMaterial({
				color,
				transparent: true,
				opacity: 0.8,
				blending: THREE.AdditiveBlending,
			});
			const dot = new THREE.Mesh(
				new THREE.CircleGeometry(0.12, 16),
				dotMat,
			);
			dot.position.set(0, height / 2 + 0.3, 0.01);
			boxGroup.add(dot);
			boxGroup.userData.dot = dot;

			boxGroup.visible = false;
			return boxGroup;
		};

		for (let i = 0; i < 10; i++) {
			const b = createScanBox(1.2, 2.2, true);
			scene.add(b);
			scanBoxes.push(b);
		}
		for (let i = 0; i < 6; i++) {
			const b = createScanBox(3.5, 1.8, false);
			scene.add(b);
			scanBoxes.push(b);
		}

		// Building texture — rich detail: concrete panels, window frames, blinds, weathering
		const createBuildingTexture = (
			isRestaurant = false,
			bType: "default" | "apartment" | "skyscraper" = "default",
		) => {
			const W = 128,
				H = 256;
			const canvas = document.createElement("canvas");
			canvas.width = W;
			canvas.height = H;
			const ctx = canvas.getContext("2d")!;
			// Base wall — slightly varied dark concrete
			const wr = (18 + Math.random() * 10) | 0,
				wg = (16 + Math.random() * 8) | 0,
				wb = (24 + Math.random() * 14) | 0;
			ctx.fillStyle = isRestaurant ? "#2a1618" : `rgb(${wr},${wg},${wb})`;
			ctx.fillRect(0, 0, W, H);
			// Concrete panel horizontal seams (floor lines)
			const flH =
				bType === "skyscraper" ? 18 : bType === "apartment" ? 22 : 20;
			ctx.strokeStyle = "rgba(0,0,0,0.45)";
			ctx.lineWidth = 1.2;
			for (let y = flH; y < H; y += flH) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(W, y);
				ctx.stroke();
			}
			// Vertical facade divisions
			ctx.strokeStyle = "rgba(0,0,0,0.2)";
			ctx.lineWidth = 0.8;
			const divW = bType === "skyscraper" ? 25 : 32;
			for (let x = divW; x < W; x += divW) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, H);
				ctx.stroke();
			}
			// Windows
			const cols = bType === "skyscraper" ? 5 : 4;
			const rows = isRestaurant ? 3 : bType === "skyscraper" ? 13 : 11;
			const ww = bType === "skyscraper" ? 17 : 22,
				wh = bType === "skyscraper" ? 11 : 14;
			const gapX = (W - cols * ww) / (cols + 1),
				gapY = (H - rows * wh) / (rows + 1);
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					const wx = gapX + c * (ww + gapX),
						wy = gapY + r * (wh + gapY);
					const lit = Math.random() > (isRestaurant ? 0.1 : 0.32);
					if (lit) {
						const warm = Math.random() > 0.35;
						const wr2 = warm
							? (200 + Math.random() * 55) | 0
							: (140 + Math.random() * 60) | 0;
						const wg2 = warm
							? (160 + Math.random() * 55) | 0
							: (190 + Math.random() * 55) | 0;
						const wb2 = warm
							? (70 + Math.random() * 60) | 0
							: (220 + Math.random() * 35) | 0;
						ctx.fillStyle = `rgb(${wr2},${wg2},${wb2})`;
						ctx.fillRect(wx, wy, ww, wh);
						// Inner frame
						ctx.strokeStyle = "rgba(0,0,0,0.3)";
						ctx.lineWidth = 1;
						ctx.strokeRect(wx + 1, wy + 1, ww - 2, wh - 2);
						// Blind lines on some windows
						if (Math.random() > 0.55) {
							ctx.strokeStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.15})`;
							ctx.lineWidth = 1;
							for (let bl = 2; bl < wh - 1; bl += 3) {
								ctx.beginPath();
								ctx.moveTo(wx + 1, wy + bl);
								ctx.lineTo(wx + ww - 1, wy + bl);
								ctx.stroke();
							}
						}
					} else {
						ctx.fillStyle = "#0c0c16";
						ctx.fillRect(wx, wy, ww, wh);
						// Dark frame
						ctx.strokeStyle = "rgba(50,55,80,0.4)";
						ctx.lineWidth = 0.8;
						ctx.strokeRect(wx, wy, ww, wh);
						// Faint reflection diagonal
						ctx.strokeStyle = "rgba(80,100,140,0.08)";
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(wx, wy + wh);
						ctx.lineTo(wx + ww, wy);
						ctx.stroke();
					}
				}
			}
			// Surface weathering / vertical streaks
			for (let s = 0; s < 6; s++) {
				const sx = Math.random() * W;
				const sg = ctx.createLinearGradient(sx, 0, sx, H);
				sg.addColorStop(0, "rgba(0,0,0,0)");
				sg.addColorStop(
					0.5,
					`rgba(0,0,0,${0.06 + Math.random() * 0.08})`,
				);
				sg.addColorStop(1, "rgba(0,0,0,0)");
				ctx.fillStyle = sg;
				ctx.fillRect(sx - 2, 0, 4, H);
			}
			// Surface dust/grain
			for (let i = 0; i < 400; i++) {
				const v = ((Math.random() - 0.5) * 20) | 0;
				ctx.fillStyle = `rgba(${128 + v},${128 + v},${136 + v},0.025)`;
				ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
			}
			return new THREE.CanvasTexture(canvas);
		};

		const createBuilding = (
			x: number,
			z: number,
			isRestaurant = false,
			restaurantName = "",
			type: "default" | "apartment" | "skyscraper" = "default",
		) => {
			const group = new THREE.Group();
			let width = 10 + Math.random() * 15,
				depth = 8 + Math.random() * 8;
			let height = isRestaurant
				? 6 + Math.random() * 4
				: 25 + Math.random() * 45;

			if (type === "skyscraper") {
				width = 12 + Math.random() * 8;
				depth = 12 + Math.random() * 8;
				height = 80 + Math.random() * 60;
			} else if (type === "apartment") {
				width = 15 + Math.random() * 10;
				depth = 10 + Math.random() * 5;
				height = 15 + Math.random() * 15;
			}

			const texture = createBuildingTexture(isRestaurant, type);
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(width / 10, height / 14);
			const buildingMat = new THREE.MeshLambertMaterial({
				map: texture,
				emissive: 0xffffff,
				emissiveMap: texture,
				emissiveIntensity: 0.12,
			});
			const building = new THREE.Mesh(
				new THREE.BoxGeometry(width, height, depth),
				buildingMat,
			);
			building.position.y = height / 2;
			building.castShadow = true;
			building.receiveShadow = true;
			group.add(building);

			// Add balconies for apartments
			if (type === "apartment") {
				const balconyGeo = new THREE.BoxGeometry(width * 0.8, 0.5, 1.5);
				const balconyMat = new THREE.MeshLambertMaterial({
					color: 0x333333,
				});
				for (let h = 4; h < height - 2; h += 4) {
					const balcony = new THREE.Mesh(balconyGeo, balconyMat);
					balcony.position.set(0, h, depth / 2 + 0.5);
					group.add(balcony);
					const balconyBack = new THREE.Mesh(balconyGeo, balconyMat);
					balconyBack.position.set(0, h, -depth / 2 - 0.5);
					group.add(balconyBack);
				}
			}

			// Add antenna for skyscrapers
			if (type === "skyscraper") {
				const antenna = new THREE.Mesh(
					new THREE.CylinderGeometry(0.1, 0.1, 15, 6),
					new THREE.MeshLambertMaterial({ color: 0x555555 }),
				);
				antenna.position.y = height + 7.5;
				group.add(antenna);
				const light = new THREE.Mesh(
					new THREE.SphereGeometry(0.5, 8, 8),
					new THREE.MeshBasicMaterial({ color: 0xff0000 }),
				);
				light.position.y = height + 15;
				group.add(light);
			}

			if (isRestaurant && restaurantName) {
				const awningColors = [
					0xff4444, 0x44aa44, 0x4444ff, 0xffaa00, 0xff44aa,
				];
				const awning = new THREE.Mesh(
					new THREE.BoxGeometry(width * 0.85, 0.25, 2.5),
					new THREE.MeshLambertMaterial({
						color: awningColors[
							Math.floor(Math.random() * awningColors.length)
						],
					}),
				);
				awning.position.set(0, height * 0.35, depth / 2 + 1.2);
				group.add(awning);
				const signCanvas = document.createElement("canvas");
				signCanvas.width = 128;
				signCanvas.height = 32;
				const signCtx = signCanvas.getContext("2d")!;
				signCtx.fillStyle = "#111";
				signCtx.fillRect(0, 0, 128, 32);
				const neonColors = ["#ff00ff", "#00ffff", "#ffff00", "#ff6600"];
				signCtx.font = "bold 16px Arial";
				signCtx.fillStyle =
					neonColors[Math.floor(Math.random() * neonColors.length)];
				signCtx.textAlign = "center";
				signCtx.fillText(restaurantName, 64, 22);
				const sign = new THREE.Mesh(
					new THREE.PlaneGeometry(width * 0.6, width * 0.12),
					new THREE.MeshBasicMaterial({
						map: new THREE.CanvasTexture(signCanvas),
						transparent: true,
					}),
				);
				sign.position.set(0, height * 0.7, depth / 2 + 0.1);
				group.add(sign);
			}
			group.position.set(x, 0, z);
			group.userData.originalZ = z;
			return group;
		};

		const createTree = (x: number, z: number) => {
			const tree = new THREE.Group();
			const trunk = new THREE.Mesh(
				new THREE.CylinderGeometry(0.15, 0.25, 2.5, 6),
				new THREE.MeshLambertMaterial({ color: 0x4a3728 }),
			);
			trunk.position.y = 1.25;
			trunk.castShadow = true;
			tree.add(trunk);
			const foliage = new THREE.Mesh(
				new THREE.SphereGeometry(1.3, 8, 6),
				new THREE.MeshLambertMaterial({ color: 0x1a4a1a }),
			);
			foliage.position.y = 3.2;
			foliage.scale.y = 0.75;
			foliage.castShadow = true;
			tree.add(foliage);
			tree.position.set(x, 0, z);
			tree.userData.originalZ = z;
			const scale = 0.7 + Math.random() * 0.4;
			tree.scale.set(scale, scale, scale);
			return tree;
		};

		const createCactus = (x: number, z: number) => {
			const cactus = new THREE.Group();
			const cactusMat = new THREE.MeshLambertMaterial({
				color: 0x2d5a27,
			});
			const body = new THREE.Mesh(
				new THREE.CylinderGeometry(0.3, 0.4, 2.5, 6),
				cactusMat,
			);
			body.position.y = 1.25;
			body.castShadow = true;
			cactus.add(body);
			if (Math.random() > 0.4) {
				const arm = new THREE.Mesh(
					new THREE.CylinderGeometry(0.15, 0.2, 1, 6),
					cactusMat,
				);
				arm.position.set(0.4, 1.5, 0);
				arm.rotation.z = -Math.PI / 3;
				arm.castShadow = true;
				cactus.add(arm);
			}
			cactus.position.set(x, 0, z);
			cactus.userData.originalZ = z;
			const scale = 0.7 + Math.random() * 0.5;
			cactus.scale.set(scale, scale, scale);
			return cactus;
		};

		const createMountain = (x: number, z: number, scale: number) => {
			const height = 35 + Math.random() * 50;
			const mountain = new THREE.Mesh(
				new THREE.ConeGeometry(20 * scale, height * scale, 5),
				new THREE.MeshLambertMaterial({
					color: 0x3a2a1a,
					flatShading: true,
				}),
			);
			mountain.position.set(x, (height * scale) / 2 - 5, z);
			mountain.rotation.y = Math.random() * Math.PI;
			mountain.userData.originalZ = z;
			return mountain;
		};

		const createPedestrian = (x: number, z: number, dir: number) => {
			const ped = new THREE.Group();
			const skinTones = [0xffdbac, 0xe5c298, 0xc68642, 0x8d5524];
			const clothesColors = [
				0x2c3e50, 0x34495e, 0x1abc9c, 0x3498db, 0x9b59b6, 0xe74c3c,
			];
			const skinTone =
				skinTones[Math.floor(Math.random() * skinTones.length)];
			const clothesColor =
				clothesColors[Math.floor(Math.random() * clothesColors.length)];
			const body = new THREE.Mesh(
				new THREE.CapsuleGeometry(0.18, 0.45, 3, 6),
				new THREE.MeshLambertMaterial({ color: clothesColor }),
			);
			body.position.y = 0.85;
			body.castShadow = true;
			ped.add(body);
			const head = new THREE.Mesh(
				new THREE.SphereGeometry(0.12, 8, 6),
				new THREE.MeshLambertMaterial({ color: skinTone }),
			);
			head.position.y = 1.35;
			head.castShadow = true;
			ped.add(head);
			const legMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
			const leftLeg = new THREE.Mesh(
				new THREE.CapsuleGeometry(0.06, 0.35, 3, 5),
				legMat,
			);
			leftLeg.position.set(-0.08, 0.28, 0);
			ped.add(leftLeg);
			const rightLeg = new THREE.Mesh(
				new THREE.CapsuleGeometry(0.06, 0.35, 3, 5),
				legMat,
			);
			rightLeg.position.set(0.08, 0.28, 0);
			ped.add(rightLeg);
			ped.position.set(x, 0, z);
			ped.rotation.y = dir > 0 ? 0 : Math.PI;
			ped.userData.originalZ = z;
			ped.userData.walkSpeed = 0.15 + Math.random() * 0.2;
			ped.userData.direction = dir;
			ped.userData.walkPhase = Math.random() * Math.PI * 2;
			ped.userData.id = `ped_${Math.random().toString(36).substr(2, 6)}`;
			return ped;
		};

		const createTrafficCar = (x: number, z: number, color: number) => {
			const car = new THREE.Group();
			const bodyMat = new THREE.MeshStandardMaterial({
				color,
				metalness: 0.6,
				roughness: 0.35,
			});
			const body = new THREE.Mesh(
				new THREE.BoxGeometry(1.6, 0.5, 3.5),
				bodyMat,
			);
			body.position.y = 0.45;
			body.castShadow = true;
			car.add(body);
			const cabin = new THREE.Mesh(
				new THREE.BoxGeometry(1.4, 0.4, 1.8),
				new THREE.MeshStandardMaterial({
					color: 0x333340,
					metalness: 0.4,
					roughness: 0.5,
				}),
			);
			cabin.position.set(0, 0.85, -0.2);
			cabin.castShadow = true;
			car.add(cabin);
			const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2020 });
			const leftTail = new THREE.Mesh(
				new THREE.BoxGeometry(0.25, 0.08, 0.04),
				tailMat,
			);
			leftTail.position.set(-0.55, 0.45, -1.77);
			car.add(leftTail);
			const rightTail = new THREE.Mesh(
				new THREE.BoxGeometry(0.25, 0.08, 0.04),
				tailMat,
			);
			rightTail.position.set(0.55, 0.45, -1.77);
			car.add(rightTail);
			car.position.set(x, 0, z);
			car.userData.originalZ = z;
			car.userData.speed = 0.2 + Math.random() * 0.3;
			car.userData.id = `car_${Math.random().toString(36).substr(2, 6)}`;
			return car;
		};

		const createLamp = (x: number, z: number, addLight: boolean) => {
			const lamp = new THREE.Group();
			const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
			const pole = new THREE.Mesh(
				new THREE.CylinderGeometry(0.06, 0.1, 5.5, 6),
				poleMat,
			);
			pole.position.y = 2.75;
			lamp.add(pole);
			const arm = new THREE.Mesh(
				new THREE.CylinderGeometry(0.03, 0.03, 1.6, 5),
				poleMat,
			);
			arm.rotation.z = Math.PI / 2;
			arm.position.set(x > 0 ? -0.8 : 0.8, 5.3, 0);
			lamp.add(arm);
			const fixture = new THREE.Mesh(
				new THREE.BoxGeometry(0.6, 0.15, 0.3),
				new THREE.MeshBasicMaterial({ color: 0xffeedd }),
			);
			fixture.position.set(x > 0 ? -1.5 : 1.5, 5.2, 0);
			lamp.add(fixture);
			if (addLight) {
				const light = new THREE.PointLight(0xffeedd, 1.5, 25, 1.8);
				light.position.set(x > 0 ? -1.5 : 1.5, 5, 0);
				lamp.add(light);
			}
			lamp.position.set(x, 0, z);
			lamp.userData.originalZ = z;
			return lamp;
		};

		const createPalmTree = (x: number, z: number) => {
			const group = new THREE.Group();
			const trunkGeo = new THREE.CylinderGeometry(0.12, 0.25, 5, 6);
			const trunk = new THREE.Mesh(
				trunkGeo,
				new THREE.MeshLambertMaterial({ color: 0x664422 }),
			);
			trunk.position.y = 2.5;
			trunk.rotation.z = (Math.random() - 0.5) * 0.25;
			group.add(trunk);
			const leafMat = new THREE.MeshLambertMaterial({
				color: 0x1f7a3d,
				side: THREE.DoubleSide,
			});
			for (let i = 0; i < 7; i++) {
				const leafWrap = new THREE.Group();
				const leaf = new THREE.Mesh(
					new THREE.PlaneGeometry(2.5, 0.7),
					leafMat,
				);
				leaf.position.x = 1.25;
				leaf.rotation.x = Math.PI / 2;
				leafWrap.add(leaf);
				leafWrap.position.y = 5;
				leafWrap.rotation.y = (i / 7) * Math.PI * 2;
				leafWrap.rotation.z = 0.5 + Math.random() * 0.3;
				group.add(leafWrap);
			}
			group.position.set(x, 0, z);
			group.userData.originalZ = z;
			const scale = 0.8 + Math.random() * 0.5;
			group.scale.set(scale, scale, scale);
			return group;
		};

		const createBeachUmbrella = (x: number, z: number) => {
			const group = new THREE.Group();
			const pole = new THREE.Mesh(
				new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6),
				new THREE.MeshLambertMaterial({ color: 0xddccaa }),
			);
			pole.position.y = 1.25;
			group.add(pole);
			const colors = [0xff4444, 0x4488ff, 0xffffff, 0xffff44];
			const top = new THREE.Mesh(
				new THREE.ConeGeometry(1.5, 0.8, 12),
				new THREE.MeshLambertMaterial({
					color: colors[Math.floor(Math.random() * colors.length)],
				}),
			);
			top.position.y = 2.2;
			group.add(top);
			group.position.set(x, 0, z);
			group.userData.originalZ = z;
			return group;
		};

		const createDune = (x: number, z: number) => {
			const group = new THREE.Group();
			const dune = new THREE.Mesh(
				new THREE.SphereGeometry(15, 16, 8),
				new THREE.MeshLambertMaterial({ color: 0xccaa88 }),
			);
			dune.scale.y = 0.25;
			dune.scale.z = 1.6;
			group.add(dune);
			group.position.set(x, -2, z);
			group.userData.originalZ = z;
			return group;
		};

		const createRock = (x: number, z: number) => {
			const rock = new THREE.Mesh(
				new THREE.IcosahedronGeometry(1.5 + Math.random() * 2, 0),
				new THREE.MeshLambertMaterial({ color: 0x665544 }),
			);
			rock.position.set(x, 0, z);
			rock.rotation.set(
				Math.random() * Math.PI,
				Math.random() * Math.PI,
				Math.random() * Math.PI,
			);
			rock.scale.set(
				1,
				0.6 + Math.random() * 0.4,
				1 + Math.random() * 0.5,
			);
			rock.userData.originalZ = z;
			return rock;
		};

		const createCloudPuffTexture = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 256;
			canvas.height = 256;
			const ctx = canvas.getContext("2d")!;
			ctx.clearRect(0, 0, 256, 256);
			// Multiple overlapping radial puffs
			const puffs = [
				[128, 128, 90],
				[90, 110, 60],
				[165, 115, 55],
				[115, 155, 50],
				[150, 150, 45],
				[80, 145, 42],
				[195, 140, 38],
			] as [number, number, number][];
			puffs.forEach(([px, py, pr]) => {
				const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
				g.addColorStop(0, "rgba(240,245,255,0.85)");
				g.addColorStop(0.4, "rgba(220,230,245,0.55)");
				g.addColorStop(0.75, "rgba(200,215,235,0.2)");
				g.addColorStop(1, "rgba(190,210,230,0)");
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(px, py, pr, 0, Math.PI * 2);
				ctx.fill();
			});
			return new THREE.CanvasTexture(canvas);
		};
		const cloudTex = createCloudPuffTexture();

		const createCloud = (x: number, y: number, z: number) => {
			const group = new THREE.Group();
			// Billboard sprites facing camera — more realistic volume
			const puffCount = 5 + Math.floor(Math.random() * 4);
			for (let i = 0; i < puffCount; i++) {
				const size = 18 + Math.random() * 22;
				const mat = new THREE.MeshBasicMaterial({
					map: cloudTex,
					transparent: true,
					opacity: 0.55 + Math.random() * 0.2,
					depthWrite: false,
					side: THREE.DoubleSide,
				});
				const p = new THREE.Mesh(
					new THREE.PlaneGeometry(size, size * 0.55),
					mat,
				);
				p.position.set(
					(Math.random() - 0.5) * 30,
					(Math.random() - 0.5) * 6,
					(Math.random() - 0.5) * 20,
				);
				p.rotation.x = -Math.PI / 2;
				p.rotation.z = Math.random() * Math.PI * 2;
				group.add(p);
			}
			group.position.set(x, y, z);
			group.userData.originalZ = z;
			return group;
		};

		// Generate world
		const restaurantNames = [
			"PIZZA",
			"SUSHI",
			"BURGER",
			"TACO",
			"COFFEE",
			"NOODLE",
		];
		// Intersection Z positions (must match the intersection loop: z=100,250,400,550...)
		const intersectionZPositions = [100, 250, 400, 550];

		for (let z = 25; z < 400; z += 40 + Math.random() * 20) {
			// Wider clearance band ±30 around each intersection — no buildings blocking side roads
			const isNearIntersection = intersectionZPositions.some(
				(iz) => Math.abs(z - iz) < 30,
			);
			if (isNearIntersection) continue;

			const type =
				Math.random() > 0.7
					? "skyscraper"
					: Math.random() > 0.4
						? "apartment"
						: "default";
			buildings.push(
				createBuilding(-25 - Math.random() * 15, z, false, "", type),
			);
			scene.add(buildings[buildings.length - 1]);
			const type2 =
				Math.random() > 0.7
					? "skyscraper"
					: Math.random() > 0.4
						? "apartment"
						: "default";
			buildings.push(
				createBuilding(25 + Math.random() * 15, z, false, "", type2),
			);
			scene.add(buildings[buildings.length - 1]);
		}

		// Add buildings along the SIDE ROAD ARMS at each intersection
		// This makes cross-streets look like real populated urban roads
		intersectionZPositions.forEach((iz) => {
			for (let arm = 0; arm < 2; arm++) {
				const sideSign = arm === 0 ? -1 : 1;
				// Place buildings at x=±30..60 (behind the roadway width of 14 units)
				for (let xi = 0; xi < 3; xi++) {
					const bx = sideSign * (30 + xi * 18 + Math.random() * 8);
					const bzOff = (Math.random() - 0.5) * 20;
					const bType = Math.random() > 0.6 ? "apartment" : "default";
					const b = createBuilding(bx, iz + bzOff, false, "", bType);
					buildings.push(b);
					scene.add(b);
				}
			}
		});
		for (let z = 0; z < 500; z += 30 + Math.random() * 20) {
			palmTrees.push(createPalmTree(12 + Math.random() * 5, z));
			scene.add(palmTrees[palmTrees.length - 1]);
			if (Math.random() > 0.5) {
				beachItems.push(
					createBeachUmbrella(
						18 + Math.random() * 8,
						z + Math.random() * 10,
					),
				);
				scene.add(beachItems[beachItems.length - 1]);
			}
		}
		// Water
		const water = new THREE.Mesh(
			new THREE.PlaneGeometry(200, 1000),
			new THREE.MeshPhongMaterial({
				color: 0x0077be,
				transparent: true,
				opacity: 0.6,
				shininess: 80,
			}),
		);
		water.rotation.x = -Math.PI / 2;
		water.position.set(130, -0.1, 250);
		scene.add(water);

		for (let z = 0; z < 300; z += 35 + Math.random() * 20) {
			trees.push(createTree(-9 - Math.random() * 3, z));
			scene.add(trees[trees.length - 1]);
			trees.push(createTree(9 + Math.random() * 3, z));
			scene.add(trees[trees.length - 1]);
		}
		for (let z = 0; z < 800; z += 60 + Math.random() * 40) {
			dunes.push(createDune(-70 - Math.random() * 40, z));
			scene.add(dunes[dunes.length - 1]);
			rocks.push(createRock(-40 - Math.random() * 20, z + 20));
			scene.add(rocks[rocks.length - 1]);
		}
		for (let z = 0; z < 600; z += 50 + Math.random() * 30) {
			cacti.push(createCactus(-60 - Math.random() * 30, z));
			scene.add(cacti[cacti.length - 1]);
			cacti.push(createCactus(60 + Math.random() * 30, z));
			scene.add(cacti[cacti.length - 1]);
		}
		for (let z = 50; z < 500; z += 60 + Math.random() * 40) {
			mountains.push(
				createMountain(
					-80 - Math.random() * 40,
					z,
					1 + Math.random() * 0.8,
				),
			);
			scene.add(mountains[mountains.length - 1]);
			mountains.push(
				createMountain(
					80 + Math.random() * 40,
					z,
					1 + Math.random() * 0.8,
				),
			);
			scene.add(mountains[mountains.length - 1]);
		}
		const restaurantPositions = [
			80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880,
		];
		restaurantPositions.forEach((z, i) => {
			const name = restaurantNames[i % restaurantNames.length];
			const side = i % 2 === 0 ? -1 : 1;
			const r = createBuilding(
				side * (18 + Math.random() * 5),
				z % 300,
				true,
				name,
			);
			restaurants.push(r);
			scene.add(r);
		});
		for (let z = 10; z < 300; z += 20) {
			const addLight = z % 40 < 20;
			lamps.push(createLamp(-8, z, addLight));
			scene.add(lamps[lamps.length - 1]);
			lamps.push(createLamp(8, z, addLight));
			scene.add(lamps[lamps.length - 1]);
		}
		// 6 total: city cars (40–80 km/h) — balanced traffic
		// Speed factor: LeadKmh = userData.speed * 10
		const cityColors = [
			0x4a4a55, 0x2a3a5a, 0x3a4a3a, 0x5a4a2a, 0x888899, 0x333333,
		];

		// 3 Traffic Cars (maximum as requested)
		for (let i = 0; i < 3; i++) {
			const tc = createTrafficCar(
				Math.random() > 0.5 ? 3 : -3, // Standard lanes
				20 + Math.random() * 380,
				cityColors[i % cityColors.length],
			);
			tc.userData.speed = 3.5 + Math.random() * 5.0;
			tc.userData.isRacer = false;
			tc.userData.id = `car_${i}`;
			tc.userData.targetX = tc.position.x;
			tc.userData.isTurning = false;
			trafficCars.push(tc);
			scene.add(tc);
		}
		const pedPositions = [
			[-10, 30],
			[10, 55],
			[-11, 80],
			[10, 110],
			[-10, 140],
			[11, 170],
			[-10, 200],
			[10, 230],
			[-11, 260],
			[10, 290],
		];
		pedPositions.forEach(([x, z], i) => {
			const ped = createPedestrian(x, z, Math.random() > 0.5 ? 1 : -1);
			ped.userData.id = `ped_${i}`;
			pedestrians.push(ped);
			scene.add(ped);
		});

		for (let i = 0; i < 8; i++) {
			const c = createCloud(
				(Math.random() - 0.5) * 200,
				40 + Math.random() * 30,
				Math.random() * 400,
			);
			clouds.push(c);
			scene.add(c);
		}

		const balloonGroup = new THREE.Group();
		const balloon = new THREE.Mesh(
			new THREE.SphereGeometry(5, 16, 12),
			new THREE.MeshLambertMaterial({ color: 0xff4444 }),
		);
		balloon.scale.y = 1.3;
		balloonGroup.add(balloon);
		const basket = new THREE.Mesh(
			new THREE.BoxGeometry(1.5, 1.2, 1.5),
			new THREE.MeshLambertMaterial({ color: 0x664422 }),
		);
		basket.position.y = -8;
		balloonGroup.add(basket);
		// Ropes
		const ropeMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
		for (let i = 0; i < 4; i++) {
			const rope = new THREE.Mesh(
				new THREE.CylinderGeometry(0.05, 0.05, 7),
				ropeMat,
			);
			rope.position.set(i % 2 === 0 ? 0.6 : -0.6, -4, i < 2 ? 0.6 : -0.6);
			balloonGroup.add(rope);
		}
		balloonGroup.position.set(-80, 50, 150);
		scene.add(balloonGroup);

		// Player car
		const carGroup = new THREE.Group();
		const wheels: THREE.Group[] = [];
		
		const gltfLoader = new GLTFLoader();
		const textureLoader = new THREE.TextureLoader();
		
		const carTexture = textureLoader.load('/aether-3d/aether-3d-texture-red.png');
		carTexture.flipY = false;
		
		gltfLoader.load('/aether-3d/aether-3d-4.glb', (gltf) => {
			const model = gltf.scene;
			(carModel as any) = model; // Type assertion to bypass incorrect inference
			model.traverse((child) => {
				if ((child as THREE.Mesh).isMesh) {
					const mesh = child as THREE.Mesh;
					mesh.castShadow = false;
					mesh.receiveShadow = false;
					if (mesh.material) {
						mesh.material = new THREE.MeshStandardMaterial({
							map: carTexture,
							metalness: 0.8,
							roughness: 0.2,
							envMapIntensity: 1.5
						});
					}
				}
			});
			
			// Slightly refined size to 0.025 for balanced perspective
			model.scale.set(0.025, 0.025, 0.025);
			model.rotation.y = -Math.PI / 2; // Face forward
			model.position.y = 0.08;
			carGroup.add(model);
		});

		// Headlights — Apple-style crisp SpotLight
		const headlightBeam = new THREE.SpotLight(0xaaddff, 3, 35, Math.PI / 8, 0.3);
		headlightBeam.position.set(0, 0.85, -2.1);
		headlightBeam.target.position.set(0, 0, -18);
		carGroup.add(headlightBeam);
		carGroup.add(headlightBeam.target);

		// Tail lights — subtle red accent
		const taillight = new THREE.Mesh(
			new THREE.BoxGeometry(1.0, 0.04, 0.08),
			new THREE.MeshBasicMaterial({ color: 0xff2020 })
		);
		taillight.position.set(0, 0.6, 1.2);
		carGroup.add(taillight);

		// Wheels placeholder array for simulation logic compatibility
		// Since wheels are now inside the GLB, we won't populate this to avoid logical conflicts

		carGroup.position.set(0, 0, 0);
		scene.add(carGroup);

		// Exhaust particles
		const exhaustParticles: {
			mesh: THREE.Mesh;
			velocity: THREE.Vector3;
			life: number;
		}[] = [];
		const exhaustGeo = new THREE.SphereGeometry(0.07, 4, 4);

		// Rain
		const rainCount = 800;
		const rainPositions = new Float32Array(rainCount * 3);
		for (let i = 0; i < rainCount; i++) {
			rainPositions[i * 3] = (Math.random() - 0.5) * 60;
			rainPositions[i * 3 + 1] = Math.random() * 25;
			rainPositions[i * 3 + 2] = Math.random() * 80;
		}
		const rainGeo = new THREE.BufferGeometry();
		rainGeo.setAttribute(
			"position",
			new THREE.BufferAttribute(rainPositions, 3),
		);
		const rainMesh = new THREE.Points(
			rainGeo,
			new THREE.PointsMaterial({
				color: 0x88bbff,
				size: 0.06,
				transparent: true,
				opacity: 0.35,
			}),
		);
		rainMesh.visible = false;
		scene.add(rainMesh);

		// State
		let mouseX = 0.5,
			mouseY = 0.3;
		let currentSpeed = 100,
			targetSpeed = 100;
		let currentSteering = 0,
			targetSteering = 0;
		let boosting = false;
		let totalDistance = 0;
		let biomeDistance = 0;
		let lastUIUpdate = 0;
		const UI_UPDATE_INTERVAL = 100;
		let warningActive = false;
		let warningDirection: "left" | "right" | null = null;
		let warningTimer = 0;
		const BRAKE_DELAY = 1.5;
		let isBrakingActive = false;
		let rainActive = false;
		let rainTimer = 8 + Math.random() * 12;

		// Input handlers
		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX / window.innerWidth;
			mouseY = e.clientY / window.innerHeight;
			if (cursorRef.current) {
				cursorRef.current.style.left = e.clientX + "px";
				cursorRef.current.style.top = e.clientY + "px";
			}
			if (cursorGlowRef.current) {
				cursorGlowRef.current.style.left = e.clientX + "px";
				cursorGlowRef.current.style.top = e.clientY + "px";
			}
		};
		window.addEventListener("mousemove", handleMouseMove);

		const handleTouchMove = (e: TouchEvent) => {
			e.preventDefault();
			const t = e.touches[0];
			mouseX = t.clientX / window.innerWidth;
			mouseY = t.clientY / window.innerHeight;
		};
		window.addEventListener("touchmove", handleTouchMove, {
			passive: false,
		});

		// Keyboard
		const keys = new Set<string>();
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space") {
				e.preventDefault();
			}
			keys.add(e.code);
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			keys.delete(e.code);
		};
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		const handleResize = () => {
			if (!containerRef.current) return;
			const width = containerRef.current.offsetWidth;
			const height = containerRef.current.offsetHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};
		window.addEventListener("resize", handleResize);

		// ── Animation ─────────────────────────────────────────────────────
		// ── Day/Night Mode Transition Logic ─────────────────────────────
		const nightSky = new THREE.Color(0x080c12);
		const daySky = new THREE.Color(0xfff0c0); // Improved realistic, warm yellowish daytime sky
		const moonColor = new THREE.Color(0xffffee);
		const sunColor = new THREE.Color(0xfff4d6); // Warmer life-like sun
		const TRANSITION_START = 8; // seconds after start
		const TRANSITION_DURATION = 25; // duration of transition
		const startPlayTime = performance.now();
		let dayFactor = 0; // 0 = night, 1 = day

		const clock = new THREE.Clock();
		let animationId: number;
		let lastTime = performance.now();

		const skyBlue = new THREE.Color(0xaabbdd);
		const pureWhite = new THREE.Color(0xffffff);
		const moonBase = new THREE.Color(0xffffdd);
		const moonOrange = new THREE.Color(0xffaa22);
		const rainBackground = new THREE.Color(0x1a1c22);
		const daySkyColor = new THREE.Color(0xb0d8f0);
		const currentTargetColor = new THREE.Color().copy(nightSky);
		let weatherIntensityFactor = 0;
		const exhaustVelocity = new THREE.Vector3();

		const animate = () => {
			animationId = requestAnimationFrame(animate);
			const now = performance.now();
			const delta = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;
			const scanTime = now * 0.001;

			// Day/Night Cycle Loop - Automatic after running
			const elapsed = (now - startPlayTime) / 1000;
			const targetDayFactor = Math.min(
				1,
				Math.max(0, (elapsed - TRANSITION_START) / TRANSITION_DURATION),
			);
			dayFactor += (targetDayFactor - dayFactor) * delta * 0.8; // smooth lerp

			// Calculate base color from day/night cycle
			currentTargetColor.copy(nightSky).lerp(daySky, dayFactor);

			// Blend with rain state
			currentTargetColor.lerp(rainBackground, weatherIntensityFactor);

			// Smoothly apply to background and fog
			if (scene.background instanceof THREE.Color) {
				scene.background.lerp(currentTargetColor, delta * 2.0);
			}
			if (scene.fog && scene.background instanceof THREE.Color) {
				scene.fog.color.copy(scene.background);
			}

			// Update Sky Dome Uniforms for a holistic realistic transition
			const topNight = new THREE.Color(0x04080f);
			const topDay = new THREE.Color(0xfff4d6); // Golden hour peak
			const midNight = new THREE.Color(0x0a1628);
			const midDay = new THREE.Color(0xffecd2); // Creamy warm atmosphere
			const horizNight = new THREE.Color(0x111c30);
			const horizDay = new THREE.Color(0xfbddb1); // Bright warm horizon
			const fogNight = new THREE.Color(0x08090e);
			const fogDay = new THREE.Color(0xffe5b0); // Hazy golden fog

			skyDomeMat.uniforms.topColor.value.copy(topNight).lerp(topDay, dayFactor);
			skyDomeMat.uniforms.midColor.value.copy(midNight).lerp(midDay, dayFactor);
			skyDomeMat.uniforms.horizColor.value.copy(horizNight).lerp(horizDay, dayFactor);
			skyDomeMat.uniforms.fogColor.value.copy(fogNight).lerp(fogDay, dayFactor);

			// Lighting intensities - Smoothly transition between modes
			const baseAmbient = 1.2 + dayFactor * 2.0; // 1.2 to 3.2
			const rainAmbient = 2.4;
			ambientLight.intensity +=
				(THREE.MathUtils.lerp(
					baseAmbient,
					rainAmbient,
					weatherIntensityFactor,
				) -
					ambientLight.intensity) *
				delta *
				1.5;

			const baseMoonIntensity = 0.6 + dayFactor * 1.4; // 0.6 to 2.0
			const rainMoonIntensity = 1.2;
			moonLight.intensity +=
				(THREE.MathUtils.lerp(
					baseMoonIntensity,
					rainMoonIntensity,
					weatherIntensityFactor,
				) -
					moonLight.intensity) *
				delta *
				1.5;

			moonLight.color.copy(skyBlue).lerp(pureWhite, dayFactor);
			(moon.material as THREE.MeshBasicMaterial).color
				.copy(moonColor)
				.lerp(sunColor, dayFactor);
			(moonGlow.material as THREE.MeshBasicMaterial).color
				.copy(moonBase)
				.lerp(moonOrange, dayFactor);
			moonGlow.scale.setScalar(1 + dayFactor * 0.5);

			stars.material.opacity =
				0.7 * (1 - dayFactor) * (1 - weatherIntensityFactor);

			for (let i = 0; i < buildings.length; i++) {
				const mesh = buildings[i].children[0] as THREE.Mesh;
				if (
					mesh &&
					mesh.material instanceof THREE.MeshLambertMaterial
				) {
					mesh.material.emissiveIntensity = 0.15 * (1 - dayFactor);
				}
			}

			for (let i = 0; i < lamps.length; i++) {
				const l = lamps[i];
				const light = l.children.find(
					(c) => c instanceof THREE.PointLight,
				) as THREE.PointLight;
				if (light)
					light.intensity =
						1.5 *
						(1 - dayFactor) *
						(1 - weatherIntensityFactor * 0.5);
			}

			// Speed (mouse Y: top = fast, bottom = slow)
			const baseMaxSpeed = boosting ? 280 : 140;
			targetSpeed = Math.max(0, (1 - mouseY) * baseMaxSpeed);

			// Only Space for Boost is kept as keyboard control
			boosting = keys.has("Space");

			// ── Obstacle detection & lane guidance ──────────────────────────
			const carX = carGroup.position.x;
			let closestObstacleDist = Infinity;
			let obstacleRelX = 0;
			const OBSTACLE_DETECT_Z = 45; // look this far ahead
			const IN_PATH_HALF = 2.2; // half-width of "in your path" zone

			const checkObj = (
				objX: number,
				objZ: number,
				halfWidth: number,
			) => {
				const relX = objX - carX;
				if (
					objZ > 4 &&
					objZ < OBSTACLE_DETECT_Z &&
					Math.abs(relX) < halfWidth
				) {
					if (objZ < closestObstacleDist) {
						closestObstacleDist = objZ;
						obstacleRelX = relX;
					}
				}
			};
			for (let i = 0; i < pedestrians.length; i++)
				checkObj(
					pedestrians[i].position.x,
					pedestrians[i].position.z,
					IN_PATH_HALF,
				);
			for (let i = 0; i < trafficCars.length; i++)
				checkObj(
					trafficCars[i].position.x,
					trafficCars[i].position.z,
					IN_PATH_HALF + 0.5,
				);

			const obstacleAhead = closestObstacleDist < OBSTACLE_DETECT_Z;
			// Reset braking state at start of evaluation logic
			isBrakingActive = false;

			if (obstacleAhead) {
				// Obstacle on the right → dodge LEFT; obstacle on the left → dodge RIGHT
				const dodgeDir: "left" | "right" =
					obstacleRelX > 0 ? "left" : "right";
				warningDirection = dodgeDir;
				warningActive = true;
				warningTimer += delta;

				// steerAmount: negative = user steered left, positive = user steered right
				const steerAmount = mouseX - 0.5;
				const userSteeredAway =
					(dodgeDir === "left" && steerAmount < -0.15) ||
					(dodgeDir === "right" && steerAmount > 0.15);

				if (userSteeredAway) {
					warningTimer = 0;
					isBrakingActive = false;
				} else if (warningTimer > BRAKE_DELAY) {
					// User ignored warning — FULL stop (hard brake)
					isBrakingActive = true;
					targetSpeed = 0; // complete stop, not just 40%
				}

				// ── 3-D ground arrows on the road pointing LEFT or RIGHT ──────
				// Arrow chevron ">" body points in +X world by default (rotation.y = 0).
				//
				//   dodgeDir 'left'  → clear lane is at LEFT → arrowLaneX = carX - 1.8
				//   dodgeDir 'right' → clear lane is at RIGHT → arrowLaneX = carX + 1.8
				//
				// Verified (Three.js standard): tip points +X world (RIGHT).
				//   dodgeDir 'left'  → rotation.y = PI → tip points LEFT ✓
				//   dodgeDir 'right' → rotation.y = 0  → tip points RIGHT ✓
				const arrowSpacing = 5.5;
				const arrowStartZ = carGroup.position.z + 7;
				const arrowLaneX =
					dodgeDir === "left" ? carX - 1.8 : carX + 1.8;

				for (let i = 0; i < 5; i++) {
					const arrow = arrowPool[i];
					const az = arrowStartZ + i * arrowSpacing;

					arrow.position.set(arrowLaneX, 0.06, az);
					arrow.rotation.set(0, dodgeDir === "left" ? Math.PI : 0, 0);
					arrow.visible = true;

					// Cascading pulse from car outward
					const phase = scanTime * 2.8 - i * 0.55;
					const pulse = 0.5 + 0.5 * Math.sin(phase);
					const distanceFade = 1 - i * 0.12;
					const opacity = (0.55 + 0.45 * pulse) * distanceFade;

					for (let j = 0; j < arrow.children.length; j++) {
						const child = arrow.children[j];
						const mat = (child as THREE.Mesh)
							.material as THREE.MeshBasicMaterial;
						if (mat) mat.opacity = opacity;
					}
				}
			} else {
				// No obstacle — clear warning, release brakes
				warningActive = false;
				warningTimer = 0;
				warningDirection = null;
				for (let i = 0; i < arrowPool.length; i++) {
					const a = arrowPool[i];
					a.visible = false;
					for (let j = 0; j < a.children.length; j++) {
						const child = a.children[j];
						const mat = (child as THREE.Mesh)
							.material as THREE.MeshBasicMaterial;
						if (mat) mat.opacity = 0;
					}
				}
			}

			// ── Safe-following distance system (Player) ─────────────────────
			// Traffic car raw speed conversion: leadKmh = rawSpeed * 10
			// Collision threshold: objZ ≈ 4.0 (half-lengths of both cars).
			const DYNAMIC_BRAKE_START = Math.max(20, currentSpeed / 6 + 8);
			const SAFE_GAP = 7.5; // ~3.5 units of visible gap (car is 4.5, so total 4.0 needed for collision)
			const COLLISION_DANGER = 4.8; // Almost touching — emergency hard stop required

			let followTargetSpeed = targetSpeed;
			let isAutoBraking = false;
			let emergencyStop = false;

			const checkFollowDistance = (
				objX: number,
				objZ: number,
				rawSpeed: number,
			) => {
				// Tight detection zone (2.0 units) — allows passing within centimeters
				if (
					objZ > 0.5 &&
					objZ < DYNAMIC_BRAKE_START &&
					Math.abs(objX - carX) < 2.0
				) {
					const leadKmh = rawSpeed * 10;

					if (objZ < COLLISION_DANGER) {
						followTargetSpeed = 0;
						emergencyStop = true;
						isAutoBraking = true;
					} else if (objZ < SAFE_GAP) {
						// Inside safety gap: match speed or go slower to restore gap
						const gapFactor = Math.max(
							0,
							(objZ - COLLISION_DANGER) /
								(SAFE_GAP - COLLISION_DANGER),
						);
						const matchingSpeed = leadKmh * gapFactor;
						if (matchingSpeed < followTargetSpeed) {
							followTargetSpeed = matchingSpeed;
							isAutoBraking = true;
						}
					} else {
						// Between BRAKE_START and SAFE_GAP: interpolate
						const t =
							(objZ - SAFE_GAP) /
							(DYNAMIC_BRAKE_START - SAFE_GAP);
						const cappedSpeed =
							leadKmh + (targetSpeed - leadKmh) * t;
						if (cappedSpeed < followTargetSpeed) {
							followTargetSpeed = cappedSpeed;
							if (followTargetSpeed < targetSpeed - 5)
								isAutoBraking = true;
						}
					}
				}
			};

			for (let i = 0; i < trafficCars.length; i++) {
				const c = trafficCars[i];
				checkFollowDistance(
					c.position.x,
					c.position.z,
					c.userData.speed as number,
				);
			}
			for (let i = 0; i < pedestrians.length; i++) {
				const p = pedestrians[i];
				checkFollowDistance(p.position.x, p.position.z, 0);
			}

			if (isAutoBraking) isBrakingActive = true;
			targetSpeed = followTargetSpeed;

			// Emergency Hard Stop
			if (emergencyStop && currentSpeed > 5) {
				currentSpeed *= 0.8;
			}

			// Apply speed with high responsiveness for braking
			const speedSense = targetSpeed < currentSpeed ? 5.5 : 2.5;
			currentSpeed += (targetSpeed - currentSpeed) * delta * speedSense;

			// Steering
			targetSteering = (mouseX - 0.5) * -2;
			targetSteering = Math.max(-1, Math.min(1, targetSteering));
			if (keys.has("ArrowLeft") || keys.has("KeyA")) targetSteering = -1;
			if (keys.has("ArrowRight") || keys.has("KeyD")) targetSteering = 1;
			currentSteering += (targetSteering - currentSteering) * delta * 5;

			const speedFactor = currentSpeed / 45;
			totalDistance += (delta * currentSpeed) / 3.6 / 100;
			biomeDistance += delta * speedFactor * 6;

			// Throttled UI updates
			if (now - lastUIUpdate > UI_UPDATE_INTERVAL) {
				lastUIUpdate = now;
				setSpeed(Math.round(currentSpeed));
				setSteering(currentSteering);
				setDistance(parseFloat(totalDistance.toFixed(2)));
				setLaneWarning({
					show: warningActive,
					direction: warningDirection,
					braking: isBrakingActive,
				});
				setIsBoosting(boosting);
				if (isBrakingActive && Math.random() < 0.1)
					setAccidentsSaved((prev) => prev + 1);

				const detected: DetectedObject[] = [];
				for (let i = 0; i < pedestrians.length; i++) {
					const ped = pedestrians[i];
					if (ped.position.z > 5 && ped.position.z < 70) {
						const relX = ped.position.x - carX;
						detected.push({
							id: ped.userData.id,
							type: "pedestrian",
							distance: Math.round(ped.position.z),
							position:
								relX < -3
									? "left"
									: relX > 3
										? "right"
										: "center",
						});
					}
				}
				for (let i = 0; i < trafficCars.length; i++) {
					const car = trafficCars[i];
					if (car.position.z > 8 && car.position.z < 90) {
						const relX = car.position.x - carX;
						detected.push({
							id: car.userData.id,
							type: "vehicle",
							distance: Math.round(car.position.z),
							position:
								relX < -1.5
									? "left"
									: relX > 1.5
										? "right"
										: "center",
						});
					}
				}
				setDetectedObjects(detected);
			}

			// Consolidated world movement
			const moveSpeed = delta * speedFactor * 15;
			const moveSpeedZ = moveSpeed * 1.2;
			for (let i = 0; i < laneGroup.children.length; i++) {
				laneGroup.children[i].position.z -= moveSpeedZ;
				if (laneGroup.children[i].position.z < -25)
					laneGroup.children[i].position.z += 325;
			}
			for (let i = 0; i < buildings.length; i++) {
				buildings[i].position.z -= moveSpeedZ;
				if (buildings[i].position.z < -35)
					buildings[i].position.z += 315;
			}
			for (let i = 0; i < trees.length; i++) {
				trees[i].position.z -= moveSpeedZ;
				if (trees[i].position.z < -30) trees[i].position.z += 310;
			}
			for (let i = 0; i < palmTrees.length; i++) {
				palmTrees[i].position.z -= moveSpeedZ;
				if (palmTrees[i].position.z < -30)
					palmTrees[i].position.z += 500;
			}
			for (let i = 0; i < beachItems.length; i++) {
				beachItems[i].position.z -= moveSpeedZ;
				if (beachItems[i].position.z < -30)
					beachItems[i].position.z += 500;
			}
			for (let i = 0; i < dunes.length; i++) {
				dunes[i].position.z -= moveSpeedZ;
				if (dunes[i].position.z < -50) dunes[i].position.z += 800;
			}
			for (let i = 0; i < rocks.length; i++) {
				rocks[i].position.z -= moveSpeedZ;
				if (rocks[i].position.z < -30) rocks[i].position.z += 800;
			}
			for (let i = 0; i < cacti.length; i++) {
				cacti[i].position.z -= moveSpeedZ;
				if (cacti[i].position.z < -30) cacti[i].position.z += 630;
			}
			for (let i = 0; i < mountains.length; i++) {
				mountains[i].position.z -= moveSpeed * 0.25;
				if (mountains[i].position.z < -50)
					mountains[i].position.z += 550;
			}
			for (let i = 0; i < restaurants.length; i++) {
				restaurants[i].position.z -= moveSpeedZ;
				if (restaurants[i].position.z < -35)
					restaurants[i].position.z += 885;
			}
			for (let i = 0; i < intersections.length; i++) {
				intersections[i].position.z -= moveSpeedZ;
				if (intersections[i].position.z < -40)
					intersections[i].position.z += 450;
			}
			for (let i = 0; i < lamps.length; i++) {
				lamps[i].position.z -= moveSpeedZ;
				if (lamps[i].position.z < -30) lamps[i].position.z += 310;
			}

			water.position.z -= moveSpeedZ;
			if (water.position.z < -250) water.position.z += 500;
			for (let i = 0; i < clouds.length; i++) {
				clouds[i].position.z -= moveSpeed * 0.4;
				if (clouds[i].position.z < -100) clouds[i].position.z += 500;
			}
			balloonGroup.position.y = 50 + Math.sin(now * 0.0008) * 8;
			balloonGroup.rotation.y += delta * 0.15;
			balloonGroup.position.z -= moveSpeed * 0.3;
			if (balloonGroup.position.z < -100) balloonGroup.position.z += 600;
			for (let i = 0; i < pedestrians.length; i++) {
				const ped = pedestrians[i];
				ped.position.z -= moveSpeed * 1.2;
				ped.position.z +=
					delta * ped.userData.walkSpeed * ped.userData.direction;
				if (ped.position.z < -20) {
					ped.position.z += 270;
					ped.position.x =
						ped.position.x > 0
							? 10 + Math.random() * 2
							: -10 - Math.random() * 2;
				}
				if (ped.position.z > 250) ped.position.z -= 270;
				ped.userData.walkPhase += delta * 6;
				const swing = Math.sin(ped.userData.walkPhase) * 0.25;
				if (ped.children[2]) ped.children[2].rotation.x = swing;
				if (ped.children[3]) ped.children[3].rotation.x = -swing;
			}

			// Traffic Movement with NPC Collision Avoidance
			for (let i = 0; i < trafficCars.length; i++) {
				const carA = trafficCars[i];
				let trafficRelSpeed = carA.userData.speed as number;

				// Traffic-to-Traffic Collision Avoidance (O(N^2) but optimized)
				for (let j = 0; j < trafficCars.length; j++) {
					const carB = trafficCars[j];
					if (carA === carB) continue;

					const relZ = carB.position.z - carA.position.z;
					// Early exit if carB is behind or too far ahead
					if (relZ <= 0 || relZ > 18) continue;

					const relX = carB.position.x - carA.position.x;
					if (Math.abs(relX) < 1.4) {
						const leadSpeed = carB.userData.speed as number;
						if (relZ < 7.0) {
							trafficRelSpeed = Math.min(
								trafficRelSpeed,
								leadSpeed * (relZ / 7.0),
							);
						} else {
							const t = (relZ - 7.0) / 11.0;
							const match =
								leadSpeed + (trafficRelSpeed - leadSpeed) * t;
							trafficRelSpeed = Math.min(trafficRelSpeed, match);
						}
					}
				}

				// Turning & Side Road Logic
				const isTurning = carA.userData.isTurning as boolean;
				const onSideRoad = carA.userData.onSideRoad as boolean;
				const currentTargetX = carA.userData.targetX as number;

				if (onSideRoad) {
					const dir = carA.userData.sideDir as number;
					carA.position.x += dir * delta * 25;
					carA.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
					carA.position.z -= moveSpeed * 1.2;
					if (Math.abs(carA.position.x) > 60) {
						carA.position.z = -50;
						carA.userData.onSideRoad = false;
					}
				} else {
					if (!isTurning && Math.random() < 0.006) {
						const zPos = carA.position.z % 150;
						if (zPos > 95 && zPos < 105) {
							carA.userData.isTurning = true;
							carA.userData.turnDir =
								Math.random() > 0.5 ? 1 : -1;
							carA.userData.targetX =
								40 * (carA.userData.turnDir as number);
						}
					}
					if (isTurning) {
						trafficRelSpeed *= 0.5;
						carA.position.x +=
							(currentTargetX - carA.position.x) * delta * 2.2;
						carA.rotation.y =
							(currentTargetX - carA.position.x) * 0.15;
						if (Math.abs(carA.position.x) > 14) {
							carA.position.z = -50;
							carA.userData.isTurning = false;
							carA.userData.targetX =
								Math.random() > 0.5 ? 3 : -3;
							carA.position.x = carA.userData.targetX;
						}
					} else {
						carA.position.x +=
							(currentTargetX - carA.position.x) * delta * 1.5;
						carA.rotation.y =
							(currentTargetX - carA.position.x) * 0.08;
					}
					carA.position.z -= moveSpeed * 1.2;
					carA.position.z += delta * trafficRelSpeed * 4;
				}

				if (carA.position.z < -25) {
					carA.position.z += 280;

					// Side-road spawning logic: Only spawn if an intersection is available ahead
					if (Math.random() < 0.28) {
						const farRoads = [];
						for (let k = 0; k < intersections.length; k++) {
							if (
								intersections[k].position.z > 40 &&
								intersections[k].position.z < 300
							) {
								farRoads.push(intersections[k]);
							}
						}

						if (farRoads.length > 0) {
							const road =
								farRoads[
									Math.floor(Math.random() * farRoads.length)
								];
							carA.userData.onSideRoad = true;
							carA.userData.sideDir =
								Math.random() > 0.5 ? 1 : -1;
							carA.position.x =
								-60 * (carA.userData.sideDir as number);
							carA.position.z = road.position.z; // Align with the actual road group
						} else {
							// Fail-safe to normal lane if no road found ahead
							carA.userData.onSideRoad = false;
							carA.userData.targetX =
								Math.random() > 0.5 ? 3 : -3;
							carA.position.x = carA.userData.targetX;
						}
					} else {
						carA.userData.onSideRoad = false;
						carA.userData.targetX = Math.random() > 0.5 ? 3 : -3;
						carA.position.x = carA.userData.targetX;
					}
					carA.userData.isTurning = false;
				}
				if (carA.position.z > 260) carA.position.z -= 280;
			}

			// Car
			carGroup.position.x = currentSteering * 4.5;
			carGroup.rotation.y = -currentSteering * 0.08;
			if (carModel) {
				carModel.rotation.z = currentSteering * 0.03;
			}
			if (boosting) {
				(taillight.material as THREE.MeshBasicMaterial).color.setHex(
					0xff4444,
				);
			} else {
				(taillight.material as THREE.MeshBasicMaterial).color.setHex(
					0xff2020,
				);
			}

			// Scan beam follows car
			scanBeamGroup.position.x = carGroup.position.x;
			(scanGrid.material as THREE.ShaderMaterial).uniforms.time.value =
				scanTime;

			// Scan boxes
			// Scan boxes: Persistent Tracking and Advanced Animation
			const activeObjectIds = new Set<string>();

			// Determine what SHOULD be visible
			const scanTargets: {
				id: string;
				x: number;
				z: number;
				isPed: boolean;
			}[] = [];
			for (let i = 0; i < pedestrians.length; i++) {
				const ped = pedestrians[i];
				if (ped.position.z > -5 && ped.position.z < 75) {
					scanTargets.push({
						id: ped.userData.id,
						x: ped.position.x,
						z: ped.position.z,
						isPed: true,
					});
				}
			}
			for (let i = 0; i < trafficCars.length; i++) {
				const car = trafficCars[i];
				if (car.position.z > -10 && car.position.z < 95) {
					scanTargets.push({
						id: car.userData.id,
						x: car.position.x,
						z: car.position.z,
						isPed: false,
					});
				}
			}

			// Update Phase for Boxes
			for (let i = 0; i < scanBoxes.length; i++) {
				const box = scanBoxes[i];
				const currentId = box.userData.objectId;
				const isPedBox = box.userData.isPedestrian;
				const target = scanTargets.find(
					(t) => t.id === currentId && t.isPed === isPedBox,
				);

				if (target) {
					activeObjectIds.add(target.id);
					box.visible = true;
					box.position.set(target.x, 1.2, target.z);
					box.lookAt(camera.position);

					if (box.userData.isClosing) {
						box.userData.isClosing = false;
					}

					const targetScale = 1.0;
					box.scale.setScalar(
						box.scale.x + (targetScale - box.scale.x) * delta * 15,
					);

					const progress = box.userData.scanProgress as number;
					const h = isPedBox ? 2.2 : 1.8;
					const laser = box.userData.laser as THREE.Mesh;
					const fill = box.userData.fill as THREE.Mesh;
					const tag = box.userData.tag as THREE.Mesh;
					const dot = box.userData.dot as THREE.Mesh;

					(
						fill.material as THREE.ShaderMaterial
					).uniforms.time.value = scanTime;
					if (progress < 1) {
						box.userData.scanProgress = Math.min(
							1,
							progress + delta * 2.5,
						);
						laser.visible = true;
						laser.position.y = h / 2 - progress * h;
						(laser.material as THREE.MeshBasicMaterial).opacity =
							0.5 + 0.5 * Math.sin(scanTime * 20.0);
						tag.visible = false;
						(dot.material as THREE.MeshBasicMaterial).opacity =
							progress;
					} else {
						laser.visible = false;
						tag.visible = true;
						tag.scale.x = 0.8 + 0.2 * Math.sin(scanTime * 3);
						dot.scale.setScalar(Math.sin(scanTime * 6) * 0.1 + 0.9);
						(dot.material as THREE.MeshBasicMaterial).opacity =
							0.8 + 0.2 * Math.sin(scanTime * 10);
					}
				} else if (currentId) {
					box.userData.isClosing = true;
					box.scale.setScalar(box.scale.x * (1 - delta * 15));
					if (box.scale.x < 0.05) {
						box.visible = false;
						box.userData.objectId = null;
						box.userData.isClosing = false;
					}
				}
			}

			// Assignment Phase for new targets
			for (let i = 0; i < scanTargets.length; i++) {
				const target = scanTargets[i];
				if (activeObjectIds.has(target.id)) continue;

				const range = target.isPed ? [0, 10] : [10, 16];
				for (let j = range[0]; j < range[1]; j++) {
					const box = scanBoxes[j];
					if (!box.userData.objectId) {
						box.userData.objectId = target.id;
						box.userData.isPedestrian = target.isPed;
						box.userData.scanProgress = 0;
						box.userData.isClosing = false;
						box.scale.setScalar(0.01);
						box.visible = true;
						box.position.set(target.x, 1.2, target.z);
						box.lookAt(camera.position);
						break;
					}
				}
			}

			// Exhaust particles (boost)
			if (boosting && Math.random() > 0.4) {
				const exhaustMat = new THREE.MeshBasicMaterial({
					color: 0xaabbdd,
					transparent: true,
					opacity: 0.5,
				});
				const p = new THREE.Mesh(exhaustGeo, exhaustMat);
				p.position.set(
					carGroup.position.x + (Math.random() - 0.5) * 0.5,
					0.3,
					2.3,
				);
				scene.add(p);
				exhaustVelocity.set(
					(Math.random() - 0.5) * 0.05,
					Math.random() * 0.05,
					0.1 + Math.random() * 0.1,
				);
				exhaustParticles.push({
					mesh: p,
					velocity: exhaustVelocity.clone(),
					life: 1.0,
				});
			}
			for (let i = exhaustParticles.length - 1; i >= 0; i--) {
				const p = exhaustParticles[i];
				p.mesh.position.add(p.velocity);
				p.life -= delta * 2;
				(p.mesh.material as THREE.MeshBasicMaterial).opacity =
					p.life * 0.6;
				if (p.life <= 0) {
					scene.remove(p.mesh);
					exhaustParticles.splice(i, 1);
				}
			}

			// Rain
			rainTimer -= delta;
			if (rainTimer <= 0) {
				rainActive = !rainActive;
				rainMesh.visible = rainActive;
				rainTimer = 8 + Math.random() * 14;
			}
			// Smooth Weather Factor Transition
			weatherIntensityFactor +=
				((rainActive ? 1 : 0) - weatherIntensityFactor) * delta * 0.8;

			if (weatherIntensityFactor > 0.01) {
				rainMesh.visible = true;
				rainMesh.material.opacity = weatherIntensityFactor * 0.35;

				// Thunder & Lightning system — rare, dramatic strikes with cooldown
				if (thunderCooldown > 0) thunderCooldown -= delta;
				if (thunderFlashPhase === 0) {
					// Idle — only attempt when cooldown has expired, low probability
					if (thunderCooldown <= 0 && Math.random() < 0.0005) {
						// Generate a fresh bolt geometry for this strike
						const newBoltGeo = createLightningBolt();
						const newGlowGeo = createLightningBolt();
						lightningBolt.geometry.dispose();
						lightningBolt.geometry = newBoltGeo;
						lightningGlow.geometry.dispose();
						lightningGlow.geometry = newGlowGeo;
						thunderFlashPhase = 1;
						thunderFlashTimer = 0;
						thunderFlashCount = 0;
						thunderTimer = 0.6 + Math.random() * 0.5;
						thunderCooldown = 25 + Math.random() * 35; // reset cooldown: next strike in 25-60s
					}
					thunderLight.intensity = 0;
					lightningBolt.visible = false;
					lightningGlow.visible = false;
				} else if (thunderFlashPhase === 1) {
					// Flash phase — rapidly blink the bolt
					thunderFlashTimer += delta;
					thunderTimer -= delta;
					const flashCycle = (thunderFlashTimer * 14) % 1.0;
					const isOn = flashCycle < 0.55;
					lightningBolt.visible = isOn;
					lightningGlow.visible = isOn;
					thunderLight.intensity = isOn ? 35 : 0;
					if (thunderTimer <= 0) {
						thunderFlashPhase = 2;
						thunderFlashTimer = 0;
					}
				} else {
					// Fade out
					thunderFlashTimer += delta;
					lightningBolt.visible = false;
					lightningGlow.visible = false;
					thunderLight.intensity = Math.max(
						0,
						35 * (1 - thunderFlashTimer / 0.25),
					);
					if (thunderFlashTimer > 0.25) {
						thunderFlashPhase = 0;
						thunderLight.intensity = 0;
					}
				}

				const pos = rainGeo.attributes
					.position as THREE.BufferAttribute;
				for (let i = 0; i < rainCount; i++) {
					pos.array[i * 3 + 1] -= 0.6;
					pos.array[i * 3 + 2] -= 0.06;
					if ((pos.array as Float32Array)[i * 3 + 1] < 0) {
						(pos.array as Float32Array)[i * 3 + 1] = 25;
						(pos.array as Float32Array)[i * 3 + 2] =
							Math.random() * 80;
					}
				}
				pos.needsUpdate = true;
			} else {
				rainMesh.visible = false;
				thunderLight.intensity = 0;
				thunderTimer = 0;
				lightningBolt.visible = false;
				lightningGlow.visible = false;
				thunderFlashPhase = 0;
			}

			// Lamp flicker (random)
			if (Math.random() < 0.002) {
				const lamp = lamps[Math.floor(Math.random() * lamps.length)];
				const light = lamp?.children.find(
					(c) => c instanceof THREE.PointLight,
				) as THREE.PointLight | undefined;
				if (light) light.intensity = 0.3 + Math.random() * 2.5;
			}

			// Camera
			const targetCamX = carGroup.position.x * 0.25;
			const targetFov = 60 + speedFactor * 8;
			camera.position.x += (targetCamX - camera.position.x) * delta * 2;
			camera.fov += (targetFov - camera.fov) * delta * 1.5;
			camera.updateProjectionMatrix();

			renderer.render(scene, camera);
		};

		animate();

		const currentContainer = containerRef.current;

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			cancelAnimationFrame(animationId);
			clearInterval(progressInterval);

			if (currentContainer && renderer.domElement) {
				currentContainer.removeChild(renderer.domElement);
			}

			// Resource Disposal
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			scene.traverse((object: any) => {
				if (object.geometry) object.geometry.dispose();
				if (object.material) {
					if (Array.isArray(object.material)) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						object.material.forEach((mat: any) => mat.dispose());
					} else {
						object.material.dispose();
					}
				}
			});
			renderer.dispose();
		};
	}, [isInView]);

	return (
		<div 
			className="relative w-full h-[88vh] bg-black overflow-hidden cursor-none group/drive"
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			<style>{`
        @keyframes appleProgressStroke {
          from { stroke-dashoffset: 440; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes appleLoaderPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes appleWarnFade {
          from { opacity: 0; transform: scale(0.88) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px); }
        }
        @keyframes appleArrowPulse {
          0%, 100% { opacity: 0.92; transform: scale(1); }
          50%       { opacity: 0.60; transform: scale(0.94); }
        }
        @keyframes appleSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes appleShimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 1.0; }
          100% { opacity: 0.4; }
        }
      `}</style>
			{/* Custom Cursor — Only show when session is active and mouse is over */}
			<div
				ref={cursorGlowRef}
				className="fixed w-32 h-32 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
				style={{
					opacity: (isHovering && isInView) ? 0.4 : 0,
					background:
						"radial-gradient(circle, rgba(0,170,255,0.3) 0%, transparent 55%)",
				}}
			/>
			<div
				ref={cursorRef}
				className="fixed w-5 h-5 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
				style={{
					opacity: (isHovering && isInView) ? 1 : 0,
					background:
						"radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,170,255,0.6) 45%, transparent 60%)",
					boxShadow:
						"0 0 20px rgba(0,170,255,0.5), 0 0 40px rgba(0,170,255,0.25)",
				}}
			/>

			{/* Three.js Canvas */}
			<div ref={containerRef} className="absolute inset-0" />

			{/* Vignette */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)",
				}}
			/>

			{/* Boost Effect */}
			{/* Boost speed-streak — subtle motion blur lines */}
			{isBoosting && (
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background:
							"radial-gradient(ellipse 60% 80% at 50% 60%, rgba(0,120,255,0.08) 0%, transparent 70%)",
						animation: "appleShimmer 0.9s ease-in-out infinite",
					}}
				/>
			)}

			{/* Screen direction overlay intentionally removed — direction is shown on road + phone only */}

			{/* Header — Apple product-page style */}
			<div className="absolute top-16 left-0 right-0 text-center z-10 pointer-events-none px-4">
				<h2 className="heading-style-h2 aether-section-title aether-section-title--light mt-2 mb-4">
					Your iPhone. Your Wheel.
				</h2>
			</div>

			{/* Accidents Avoided Counter - Moved to Bottom Left above HUD */}
			<div className="absolute bottom-[104px] left-8 z-20 pointer-events-none font-sans">
				<div className="bg-[#1c1c1e]/70 backdrop-blur-3xl border border-white/10 px-5 py-2.5 rounded-full shadow-2xl transition-all duration-700 flex items-center gap-5">
					<div className="flex items-center gap-2.5">
						<div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
						<p className="text-[9px] uppercase tracking-widest text-white/50 font-medium whitespace-nowrap">
							Safety AI
						</p>
					</div>
					<div className="w-[1px] h-3.5 bg-white/10" />
					<div className="flex items-baseline gap-2">
						<p className="text-xl font-light tabular-nums text-white leading-none tracking-tight">
							{accidentsSaved}
						</p>
						<p className="text-[11px] font-normal text-white/40 whitespace-nowrap">
							Accidents Saved
						</p>
					</div>
				</div>
			</div>

			{/* iPhone */}
			<div
				className="absolute bottom-8 right-8 z-20"
				style={{
					transform: `perspective(1200px) rotateY(${steering * -12}deg) rotateX(${(speed / 140) * 4}deg)`,
					transition: "transform 0.1s ease-out",
				}}
			>
				<div className="relative w-[220px] h-[440px] bg-[#1c1c1e] rounded-[44px] p-[3px] shadow-2xl border border-white/10">
					{/* Dynamic Island */}
					<div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-10 flex items-center justify-center gap-2">
						<div className="w-[6px] h-[6px] bg-emerald-500 rounded-full animate-pulse" />
						<span className="text-[9px] text-white/50 font-medium tracking-wide">
							Live
						</span>
					</div>

					{/* Screen */}
					<div className="w-full h-full bg-black rounded-[42px] overflow-hidden relative">
						<div className="absolute inset-0 p-5 pt-12 flex flex-col">
							{/* Title */}
							<div className="flex items-center justify-center mb-4">
								<p className="text-[10px] text-white/40 font-medium tracking-[0.2em]">
									AETHER DRIVE
								</p>
							</div>

							{/* Speed */}
							<div className="flex-shrink-0 text-center mb-5">
								<div className="inline-flex items-baseline">
									<span className="text-[56px] font-thin text-white tabular-nums leading-none">
										{speed}
									</span>
									<span className="text-[14px] text-white/30 font-light ml-1">
										km/h
									</span>
								</div>
							</div>

							{/* Steering bar */}
							<div className="relative h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
								<div
									className={`absolute top-0 h-full w-8 rounded-full transition-all duration-75 ${
										laneWarning.braking
											? "bg-gradient-to-r from-red-500/50 via-red-400 to-red-500/50"
											: laneWarning.show
												? "bg-gradient-to-r from-amber-500/50 via-amber-400 to-amber-500/50"
												: "bg-gradient-to-r from-cyan-500/50 via-cyan-400 to-cyan-500/50"
									}`}
									style={{
										left: `calc(50% - 16px + ${steering * 40}%)`,
									}}
								/>
							</div>

							{/* Lane warning on phone — Apple style */}
							{laneWarning.show && (
								<div
									className="flex items-center gap-2.5 mb-3 px-3 py-2.5 rounded-2xl"
									style={{
										background: laneWarning.braking
											? "rgba(255,69,58,0.12)"
											: "rgba(255,255,255,0.07)",
										border: `1px solid ${laneWarning.braking ? "rgba(255,69,58,0.25)" : "rgba(255,255,255,0.12)"}`,
										animation:
											"appleWarnFade 0.35s ease both",
									}}
								>
									<span
										style={{
											fontSize: 16,
											color: laneWarning.braking
												? "#ff453a"
												: "#ffffff",
										}}
									>
										{laneWarning.braking
											? "⚠"
											: laneWarning.direction === "left"
												? "←"
												: "→"}
									</span>
									<span
										style={{
											fontSize: 10,
											fontWeight: 500,
											letterSpacing: "0.06em",
											color: laneWarning.braking
												? "#ff453a"
												: "rgba(255,255,255,0.75)",
										}}
									>
										{laneWarning.braking
											? "Auto Braking"
											: `Move ${laneWarning.direction === "left" ? "Left" : "Right"}`}
									</span>
								</div>
							)}

							{/* Detected Objects */}
							<div className="flex-1 min-h-0">
								<div className="flex items-center justify-between mb-3">
									<p className="text-[11px] text-white/40 font-medium">
										Nearby
									</p>
									<p className="text-[11px] text-white/25">
										{detectedObjects.length} detected
									</p>
								</div>
								<div className="space-y-2 overflow-y-auto max-h-[130px]">
									{detectedObjects
										.slice(0, 4)
										.map((obj, i) => (
											<div
												key={obj.id}
												className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-xl"
												style={{
													animationDelay: `${i * 50}ms`,
												}}
											>
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${obj.type === "pedestrian" ? "bg-emerald-500/15" : "bg-blue-500/15"}`}
												>
													<span className="text-sm">
														{obj.type ===
														"pedestrian"
															? "🚶"
															: "🚗"}
													</span>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-[12px] text-white/80 font-normal capitalize">
														{obj.type}
													</p>
													<p className="text-[10px] text-white/30">
														{obj.position} side
													</p>
												</div>
												<div className="text-right">
													<p className="text-[14px] text-white/70 font-light tabular-nums">
														{obj.distance}m
													</p>
												</div>
											</div>
										))}
									{detectedObjects.length === 0 && (
										<div className="flex flex-col items-center justify-center py-6">
											<div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-2">
												<span className="text-lg opacity-50">
													✓
												</span>
											</div>
											<p className="text-[11px] text-white/25">
												Path is clear
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Bottom stats */}
							<div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
								<div>
									<p className="text-[10px] text-white/25">
										Distance
									</p>
									<p className="text-[13px] text-white/60 font-light tabular-nums">
										{distance} km
									</p>
								</div>
								{isBoosting && (
									<div className="px-3 py-1 bg-blue-500/20 rounded-full">
										<span className="text-[10px] text-blue-400 font-medium">
											⚡ Boost
										</span>
									</div>
								)}
								<div className="text-right">
									<p className="text-[10px] text-white/25">
										Range
									</p>
									<p className="text-[13px] text-white/60 font-light">
										412 km
									</p>
								</div>
							</div>
						</div>
						<div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/15 rounded-full" />
					</div>

					{/* Side buttons */}
					<div className="absolute -right-[1px] top-28 w-[3px] h-10 bg-[#2c2c2e] rounded-l" />
					<div className="absolute -left-[1px] top-24 w-[3px] h-6 bg-[#2c2c2e] rounded-r" />
					<div className="absolute -left-[1px] top-36 w-[3px] h-10 bg-[#2c2c2e] rounded-r" />
				</div>

				{/* Connection beam */}
				<div
					className="absolute -left-28 top-1/2 w-28 h-[2px] opacity-50"
					style={{
						background:
							"linear-gradient(90deg, transparent, rgba(0,200,255,0.6), rgba(0,220,255,0.9))",
					}}
				/>
				<div
					className="absolute -left-28 top-1/2 w-28 h-4 opacity-15 blur-sm -translate-y-1.5"
					style={{
						background:
							"linear-gradient(90deg, transparent, rgba(0,200,255,0.8))",
					}}
				/>
			</div>

			{/* HUD — Apple frosted-glass pills */}
			<div className="absolute bottom-8 left-8 z-10 flex gap-2 font-sans">
				<div className="bg-[#1c1c1e]/70 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-2.5">
					<div className="text-white/40 text-[9px] tracking-widest uppercase mb-0.5 font-medium">
						Speed
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-2xl font-light text-white tabular-nums tracking-tight">
							{speed}
						</span>
						<span className="text-[10px] text-white/30 font-normal">
							km/h
						</span>
					</div>
				</div>
				<div className="bg-[#1c1c1e]/70 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-2.5">
					<div className="text-white/40 text-[9px] tracking-widest uppercase mb-0.5 font-medium">
						Distance
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-2xl font-light text-white tabular-nums tracking-tight">
							{distance}
						</span>
						<span className="text-[10px] text-white/30 font-normal">
							km
						</span>
					</div>
				</div>
			</div>

			{/* Controls — Apple-style frosted panel */}
			<div className="absolute top-8 left-8 z-10 font-sans">
				<div className="bg-[#1c1c1e]/70 backdrop-blur-3xl border border-white/10 rounded-[14px] px-3.5 py-3 min-w-[170px]">
					<div className="text-white/35 text-[9px] tracking-widest uppercase mb-2 font-medium">
						Controls
					</div>
					{[
						["↕ Mouse", "Speed"],
						["↔ Mouse", "Steer"],
						["Space", "Boost"],
					].map(([key, val]) => (
						<div
							key={key}
							className="flex justify-between gap-4 mb-1"
						>
							<span className="text-[10px] text-white/50 font-normal">
								{key}
							</span>
							<span className="text-[10px] text-white/30">
								{val}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Loading Screen — Apple Minimalist Aesthetic */}
			{isLoading && (
				<div
					className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#000]"
					style={{ transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
				>
					<div className="relative flex flex-col items-center">
						{/* Apple-style circular progress */}
						<div className="relative w-48 h-48 flex items-center justify-center">
							<svg className="w-full h-full transform -rotate-90">
								<circle
									cx="96"
									cy="96"
									r="70"
									stroke="currentColor"
									strokeWidth="1"
									fill="transparent"
									className="text-white/10"
								/>
								<circle
									cx="96"
									cy="96"
									r="70"
									stroke="currentColor"
									strokeWidth="1.5"
									fill="transparent"
									strokeDasharray="440"
									style={{
										strokeDashoffset: 440 - (440 * loadProgress) / 100,
										transition: "stroke-dashoffset 0.5s ease",
										color: "#fff"
									}}
									strokeLinecap="round"
								/>
							</svg>

							{/* Center Content */}
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<div className="text-white text-4xl font-extralight tracking-tight tabular-nums mb-1">
									{Math.round(loadProgress)}
								</div>
								<div className="text-white/20 text-[9px] font-medium tracking-[0.4em] uppercase">
									Percent
								</div>
							</div>
						</div>

						{/* Brand Text */}
						<div className="mt-16 flex flex-col items-center gap-3">
							<div className="flex items-center gap-4">
								<div className="h-[1px] w-8 bg-gradient-to-l from-white/20 to-transparent" />
								<h2 className="text-white font-medium tracking-[0.5em] text-[10px] uppercase">
									Aether Driving Simulation
								</h2>
								<div className="h-[1px] w-8 bg-gradient-to-r from-white/20 to-transparent" />
							</div>
							<p className="text-white/40 text-[11px] font-light tracking-wide italic">
								Synchronizing Aether Neural Core...
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Subtle top-edge ambient — Apple Vision-style */}
			<div
				className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none z-10"
				style={{
					background:
						"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent 100%)",
				}}
			/>
			<div
				className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none z-10"
				style={{
					background:
						"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
				}}
			/>
		</div>
	);
}
