import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FrameSequenceHeroProps {
  onEnterWorkspace: () => void;
}

const TOTAL_FRAMES = 240;

export const FrameSequenceHero: React.FC<FrameSequenceHeroProps> = ({ onEnterWorkspace }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<'intro' | 'focus' | 'mission'>('intro');
  const [scrollPercent, setScrollPercent] = useState(0);

  // Preloaded image objects in memory
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef({ frame: 0 });

  // 1. Preload 240 frames
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `/frames/frame_${numStr}.jpg`;

      img.onload = () => {
        if (isCancelled) return;
        loadedCount++;
        const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        setLoadProgress(pct);

        // Immediately paint first frame so there is zero delay
        if (i === 1) {
          requestAnimationFrame(() => renderFrame(0));
        }

        if (loadedCount === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setIsLoaded(true);
      };

      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Draw active frame onto Canvas with Apple High-DPI Cover fit
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    // Fill background obsidian void
    ctx.fillStyle = '#080304';
    ctx.fillRect(0, 0, w, h);

    // Compute aspect-fit/cover
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = w;
      drawHeight = w / imgRatio;
      offsetY = (h - drawHeight) / 2;
    } else {
      drawHeight = h;
      drawWidth = h * imgRatio;
      offsetX = (w - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // 3. Setup GSAP ScrollTrigger to scrub the 240 frames over 300vh
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Resize canvas to match display size
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderFrame(Math.round(frameIndexRef.current.frame));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial render
    if (imagesRef.current[0]) {
      renderFrame(0);
    }

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => {
        const progress = self.progress;
        setScrollPercent(Math.round(progress * 100));

        // Milestones
        if (progress < 0.32) {
          setCurrentMilestone('intro');
        } else if (progress < 0.68) {
          setCurrentMilestone('focus');
        } else {
          setCurrentMilestone('mission');
        }

        // Scrub frame from 0 to TOTAL_FRAMES - 1
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
        );
        frameIndexRef.current.frame = targetFrame;
        renderFrame(targetFrame);
      },
    });

    return () => {
      trigger.kill();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isLoaded]);

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-[#080304]">
      {/* Sticky Full-Viewport Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Ambient Top & Bottom Obsidian Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-[#080304] via-transparent to-[#080304]/80" />

        {/* Floating Kinetic Typography Overlays */}
        <div className="relative z-20 w-full max-w-5xl px-6 mx-auto text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {currentMilestone === 'intro' && (
              <motion.div
                key="milestone-intro"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A080A]/80 border border-[#E5B84B]/30 backdrop-blur-md shadow-[0_0_20px_rgba(229,184,75,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-[#E5B84B] animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-widest text-[#F9D976] uppercase">
                    CHRONOMETER VAULT • ASSEMBLED CUBE
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white uppercase drop-shadow-2xl">
                  LEARNVAULT — <span className="text-gold-gradient">DAY 7 OF 1,460</span>
                </h1>

                <p className="text-base sm:text-xl font-light text-[#D4AF37]/90 max-w-2xl mx-auto tracking-wide">
                  Your Knowledge. Your Progress. Your Future.
                </p>

                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-[#A89279]">
                  <span>SCROLL DOWN TO DISASSEMBLE</span>
                  <ChevronDown className="w-4 h-4 animate-bounce text-[#E5B84B]" />
                </div>
              </motion.div>
            )}

            {currentMilestone === 'focus' && (
              <motion.div
                key="milestone-focus"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A080A]/80 border border-[#E5B84B]/30 backdrop-blur-md shadow-[0_0_20px_rgba(229,184,75,0.2)]">
                  <Layers className="w-3.5 h-3.5 text-[#E5B84B]" />
                  <span className="text-xs font-mono font-bold tracking-widest text-[#F9D976] uppercase">
                    INTERNAL TECH DISASSEMBLY • 120 FPS
                  </span>
                </div>

                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white uppercase drop-shadow-2xl max-w-4xl mx-auto leading-tight">
                  PRECISION ENGINEERED FOCUS — <br />
                  <span className="text-gold-gradient">DSA, PROJECTS & DEEP WORK</span>
                </h2>

                <p className="text-sm sm:text-lg font-light text-[#D4AF37]/80 max-w-xl mx-auto">
                  Matte black glass panels slide out to expose golden chronometer gears and glowing amber core.
                </p>
              </motion.div>
            )}

            {currentMilestone === 'mission' && (
              <motion.div
                key="milestone-mission"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 pointer-events-auto"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A080A]/80 border border-[#E5B84B]/40 backdrop-blur-md shadow-[0_0_25px_rgba(229,184,75,0.3)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5B84B]" />
                  <span className="text-xs font-mono font-bold tracking-widest text-[#F9D976] uppercase">
                    SUSPENDED EXPLODED VIEW • READY
                  </span>
                </div>

                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white uppercase drop-shadow-2xl">
                  ENTER TODAY'S <span className="text-gold-gradient">MISSION</span>
                </h2>

                <p className="text-sm sm:text-base text-[#D4AF37]/90 max-w-md mx-auto">
                  Full command deck unlocked. Step directly into your daily focus engine.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onEnterWorkspace}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full btn-liquid-gold text-sm tracking-wider uppercase font-bold cursor-pointer group shadow-[0_0_30px_rgba(229,184,75,0.4)]"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Scroll Telemetry HUD */}
        <div className="absolute bottom-6 left-8 right-8 z-20 flex items-center justify-between text-xs font-mono text-[#A89279]/70 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B84B]" />
            <span>LEARNVAULT CHRONOMETER CUBE // EXPLODED TECH SHOWCASE</span>
          </div>

          <div className="flex items-center gap-4">
            <span>SCROLL scrub: {scrollPercent}%</span>
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E5B84B] to-[#F9D976] transition-all duration-75"
                style={{ width: `${scrollPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Loading Overlay if frames are loading */}
        {!isLoaded && loadProgress < 100 && (
          <div className="absolute inset-0 z-30 bg-[#080304] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#E5B84B]/20 border-t-[#E5B84B] animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xs font-mono tracking-widest text-[#E5B84B] uppercase font-bold">
                PRELOADING 240 CHRONOMETER FRAMES
              </p>
              <p className="text-xs font-mono text-[#887766]">{loadProgress}% CACHED</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
