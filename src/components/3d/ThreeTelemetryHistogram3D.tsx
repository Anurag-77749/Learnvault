import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeTelemetryHistogram3DProps {
  className?: string;
  size?: number;
}

export const ThreeTelemetryHistogram3D: React.FC<ThreeTelemetryHistogram3DProps> = ({
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
    camera.position.set(2.8, 2.5, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const group = new THREE.Group();
    scene.add(group);

    // 4x4 Grid of 3D Data Bars
    const bars: THREE.Mesh[] = [];
    const barGeo = new THREE.BoxGeometry(0.24, 1.0, 0.24);

    const grid = 4;
    const spacing = 0.38;
    const offset = ((grid - 1) * spacing) / 2;

    for (let x = 0; x < grid; x++) {
      for (let z = 0; z < grid; z++) {
        const mat = new THREE.MeshStandardMaterial({
          color: (x + z) % 2 === 0 ? 0x00f59b : 0xffd600,
          emissive: (x + z) % 2 === 0 ? 0x00a86b : 0xaa8800,
          emissiveIntensity: 0.35,
          roughness: 0.2,
          metalness: 0.8,
        });
        const bar = new THREE.Mesh(barGeo, mat);
        bar.position.set(x * spacing - offset, 0, z * spacing - offset);
        group.add(bar);
        bars.push(bar);
      }
    }

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

      group.rotation.y = elapsed * 0.3 + mouseX * 0.4;
      group.rotation.x = 0.2 + mouseY * 0.3;

      // Pulsing wave height on bars
      bars.forEach((bar, idx) => {
        const row = Math.floor(idx / grid);
        const col = idx % grid;
        const wave = Math.sin(elapsed * 2.5 + row * 0.8 + col * 0.6) * 0.45 + 0.65;
        bar.scale.y = Math.max(0.15, wave);
        bar.position.y = (bar.scale.y * 1.0) / 2 - 0.5;
      });

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
        <span className="text-[9px] font-mono tracking-widest text-[#00F59B] uppercase font-bold px-2 py-0.5 rounded-full bg-black/60 border border-[#00F59B]/30 shadow-sm">
          // 3D TELEMETRY MATRIX
        </span>
      </div>
    </div>
  );
};
