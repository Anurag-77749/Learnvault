import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeEntropySingularity3DProps {
  className?: string;
  size?: number;
}

export const ThreeEntropySingularity3D: React.FC<ThreeEntropySingularity3DProps> = ({
  className = '',
  size = 220,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Dual Cone Spiral Particle Hourglass (Entropy Singularity)
    const particleCount = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialRadii = new Float32Array(particleCount);
    const heights = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * 2 - 1; // -1 to 1
      const theta = Math.random() * Math.PI * 2;
      const r = Math.abs(u) * 1.2 + 0.1;

      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = u * 1.3;
      positions[i * 3 + 2] = r * Math.sin(theta);

      initialRadii[i] = r;
      heights[i] = u;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(geo, mat);
    group.add(particles);

    // Central Singularity Bead
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouse);

    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      group.rotation.y = elapsed * 0.75 + mouseX * 0.5;
      group.rotation.x = Math.sin(elapsed * 0.3) * 0.15 + mouseY * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouse);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <div ref={mountRef} className="cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 text-center pointer-events-none">
        <span className="text-[9px] font-mono tracking-widest text-rose-400 uppercase font-bold px-2 py-0.5 rounded-full bg-black/60 border border-rose-500/30 shadow-sm">
          // 3D ENTROPY SINGULARITY
        </span>
      </div>
    </div>
  );
};
