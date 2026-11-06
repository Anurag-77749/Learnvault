import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDown, 
  Sparkles, 
  Layers, 
  Cpu, 
  Code2, 
  Briefcase, 
  Bookmark, 
  ChevronRight,
  Play
} from 'lucide-react';

interface AppleScrollShowcaseProps {
  onEnterWorkspace: () => void;
}

export const AppleScrollShowcase: React.FC<AppleScrollShowcaseProps> = ({ onEnterWorkspace }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [scrollFraction, setScrollFraction] = useState(0);

  // 3D Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const componentsRef = useRef<{
    sphere: THREE.Mesh;
    innerCore: THREE.Mesh;
    ring1: THREE.Mesh;
    ring2: THREE.Mesh;
    laserRing: THREE.Mesh;
    particles: THREE.Points;
  } | null>(null);

  // 1. Setup Three.js 3D Exploded-View Canvas
  useEffect(() => {
    const mount = canvasContainerRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Studio Lights (Apple Dark Studio photoshoot setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const orangeRimLight = new THREE.DirectionalLight(0xff5500, 4.5);
    orangeRimLight.position.set(-8, -4, -4);
    scene.add(orangeRimLight);

    const pointLight = new THREE.PointLight(0xff7722, 3.0, 12);
    pointLight.position.set(0, 1.8, 3);
    scene.add(pointLight);

    // Component 1: Central Smoked Obsidian Sphere (Liquid Mirror)
    const sphereGeo = new THREE.SphereGeometry(0.85, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x141418,
      roughness: 0.08,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.98,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Component 2: Inner Glowing Energy Core
    const innerGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerCore);

    // Component 3: Ring 1 - Brushed Titanium Gyro Frame
    const ringGeo1 = new THREE.TorusGeometry(1.4, 0.055, 32, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xe6e6ea,
      roughness: 0.22,
      metalness: 0.92,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3.2;
    ring1.rotation.y = Math.PI / 6;
    scene.add(ring1);

    // Component 4: Ring 2 - Smoked Optical Glass Ring
    const ringGeo2 = new THREE.TorusGeometry(1.28, 0.045, 32, 100);
    const ringMat2 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.52,
      thickness: 0.45,
      specularIntensity: 1.6,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3.8;
    ring2.rotation.z = Math.PI / 4;
    scene.add(ring2);

    // Component 5: Ring 3 - Electric Laser Orbit Ring
    const laserGeo = new THREE.TorusGeometry(1.65, 0.018, 16, 120);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.9,
    });
    const laserRing = new THREE.Mesh(laserGeo, laserMat);
    laserRing.rotation.x = Math.PI / 2;
    scene.add(laserRing);

    // Component 6: Particle Dust Matrix
    const particlesCount = 140;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const rad = 1.6 + Math.random() * 2.2;
      const th = Math.random() * Math.PI * 2;
      const ph = (Math.random() - 0.5) * Math.PI;
      posArray[i] = rad * Math.cos(th) * Math.cos(ph);
      posArray[i + 1] = rad * Math.sin(ph);
      posArray[i + 2] = rad * Math.sin(th) * Math.cos(ph);
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    componentsRef.current = {
      sphere,
      innerCore,
      ring1,
      ring2,
      laserRing,
      particles,
    };

    // Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      // Continuous subtle ambient drift
      if (componentsRef.current) {
        componentsRef.current.particles.rotation.y = elapsed * 0.05;
        componentsRef.current.innerCore.rotation.y = elapsed * 0.4;
      }

      renderer.render(scene, camera);
    };

    render();

    // Window Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 2. Scroll-Driven 3D Frame Interpolation (Apple Scrollytelling Mechanics)
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = container.scrollHeight - window.innerHeight;
      const currentScroll = Math.max(0, -rect.top);
      const fraction = Math.min(1, Math.max(0, currentScroll / totalScrollable));
      setScrollFraction(fraction);

      // Scrub 3D elements based on scroll fraction
      const comps = componentsRef.current;
      const camera = cameraRef.current;
      if (!comps || !camera) return;

      // Camera Orbit & Zoom
      const targetZ = 6.2 - fraction * 1.8; // 6.2 -> 4.4
      const targetY = (fraction - 0.5) * 0.8;
      camera.position.z = targetZ;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Phase 1 (0 to 0.3): Assembled Rotation
      // Phase 2 (0.3 to 0.7): Exploded Disassembly (Exploded View Animation)
      // Phase 3 (0.7 to 1.0): Convergence into Final Core

      const explosionFactor = Math.sin(fraction * Math.PI); // 0 -> 1 -> 0

      // Explode Titanium Ring along X/Y
      comps.ring1.position.x = explosionFactor * 1.6;
      comps.ring1.position.y = explosionFactor * 0.8;
      comps.ring1.rotation.z = fraction * Math.PI * 2;

      // Explode Optical Glass Ring along -X/-Z
      comps.ring2.position.x = -explosionFactor * 1.5;
      comps.ring2.position.z = explosionFactor * 1.2;
      comps.ring2.rotation.y = -fraction * Math.PI * 2.5;

      // Explode Laser Ring outwards (Expansion)
      const laserScale = 1 + explosionFactor * 0.8;
      comps.laserRing.scale.set(laserScale, laserScale, laserScale);
      comps.laserRing.rotation.z = fraction * Math.PI * 3;

      // Central Sphere gentle rotation
      comps.sphere.rotation.y = fraction * Math.PI * 3;
      comps.sphere.rotation.x = fraction * Math.PI * 0.8;

      // Inner Core Glow intensity
      comps.innerCore.scale.set(
        1 + explosionFactor * 0.4,
        1 + explosionFactor * 0.4,
        1 + explosionFactor * 0.4
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[220vh] bg-[#050505] text-[#F5F5F7] select-none">
      {/* Sticky 3D Viewport (Full Screen Pin) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Three.js Canvas Container */}
        <div ref={canvasContainerRef} className="absolute inset-0 z-0 pointer-events-none" />

        {/* Ambient Studio Lighting Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255, 85, 0, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Top Floating Mini-HUD */}
        <div className="absolute top-6 inset-x-0 z-20 px-6 sm:px-12 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shadow-[0_0_10px_#FF5500] animate-pulse" />
            <span className="font-display font-black text-sm tracking-tight text-white">
              LEARNVAULT
            </span>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold tracking-widest ml-1">
              // APPLE-STYLE 3D ARCHITECTURE
            </span>
          </div>

          <button
            onClick={onEnterWorkspace}
            className="px-4 py-2 rounded-full btn-mercury text-xs font-black flex items-center gap-2 shadow-xl cursor-pointer"
          >
            <span>Enter Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SCROLL-DRIVEN OVERLAY CONTENT PHASES */}
        
        {/* Phase 1 (0% to 25%): The Assembled Core */}
        <div
          className={`absolute inset-x-0 max-w-4xl mx-auto px-6 text-center transition-all duration-500 pointer-events-none ${
            scrollFraction >= 0 && scrollFraction < 0.28
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FORWARD DEPLOYED ENGINEERING WORKSPACE</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-none">
            Precision Intelligence.
            <br />
            <span className="bg-gradient-to-r from-white via-[#E0E0E6] to-[#9898A0] bg-clip-text text-transparent">
              Engineered in 3D.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#9898A0] max-w-xl mx-auto mt-4 font-sans leading-relaxed">
            Scroll down to dissect the internal architecture of LearnVault—built for high-speed mastery, LeetCode algorithms, and distributed systems.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-[#9898A0] animate-bounce">
            <ArrowDown className="w-4 h-4 text-[#FF5500]" />
            <span>SCROLL TO EXPLODE ARCHITECTURE</span>
          </div>
        </div>

        {/* Phase 2 (30% to 65%): Exploded-View Technical Disassembly */}
        <div
          className={`absolute inset-x-0 max-w-5xl mx-auto px-6 transition-all duration-500 pointer-events-none ${
            scrollFraction >= 0.32 && scrollFraction < 0.68
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Telemetry Annotation */}
            <div className="space-y-4 text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold block">
                // EXPLODED INTERNAL VIEW
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Dissected Down to the Silicon.
              </h2>
              <p className="text-xs sm:text-sm text-[#9898A0] leading-relaxed">
                Every component floats in suspension. From the 1,460-day macro curriculum timeline to spaced-repetition algorithm retention queues.
              </p>

              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.09] flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500]">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Algorithms & DSA Queue</div>
                    <div className="text-[10px] font-mono text-[#9898A0]">1, 3, 7, 30-day automated memory recall</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.09] flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">FDE Career HQ</div>
                    <div className="text-[10px] font-mono text-[#9898A0]">Multi-round interview & question tracker</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Telemetry Chip */}
            <div className="text-right hidden md:block">
              <div className="inline-block p-4 rounded-2xl bg-black/60 border border-white/[0.1] text-left space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#9898A0] block">CORE TELEMETRY</span>
                <div className="font-mono tabular-nums font-black text-3xl text-white">892 TOPICS</div>
                <div className="text-[11px] font-mono text-[#10B981]">100% HARDWARE ACCELERATED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3 (70% to 100%): Reassembly & Launch Action */}
        <div
          className={`absolute inset-x-0 max-w-3xl mx-auto px-6 text-center transition-all duration-500 ${
            scrollFraction >= 0.72
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold block mb-2">
            // FULL SYSTEM REASSEMBLY COMPLETE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
            Ready for Deployment.
          </h2>
          <p className="text-xs sm:text-sm text-[#9898A0] max-w-lg mx-auto mt-3">
            All 10 professional domains are primed. Enter the live workspace or switch between 3D Spatial Rotunda and 2D Command Grid.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterWorkspace}
              className="px-6 py-3 rounded-full btn-mercury text-xs sm:text-sm font-black flex items-center gap-2 shadow-2xl cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-[#050507]" />
              <span className="font-mono uppercase">Enter Live Workspace</span>
            </button>
          </div>
        </div>

        {/* Bottom Scroll Scrubber Indicator */}
        <div className="absolute bottom-6 inset-x-0 px-6 max-w-xs mx-auto z-20 flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#9898A0]">0%</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden border border-white/[0.08]">
            <div 
              className="h-full bg-gradient-to-r from-white to-[#FF5500] rounded-full transition-all duration-150"
              style={{ width: `${Math.round(scrollFraction * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-white font-bold">{Math.round(scrollFraction * 100)}%</span>
        </div>

      </div>
    </div>
  );
};
