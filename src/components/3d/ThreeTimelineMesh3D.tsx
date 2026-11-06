import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeTimelineMesh3DProps {
  className?: string;
  size?: number;
}

export const ThreeTimelineMesh3D: React.FC<ThreeTimelineMesh3DProps> = ({
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
    camera.position.set(2.4, 2.0, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const group = new THREE.Group();
    scene.add(group);

    // 4 Milestone Pillars along timeline axis
    const colors = [0xffd600, 0x00f59b, 0x38bdf8, 0xa855f7];
    const pillars: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const h = 0.5 + i * 0.35;
      const geo = new THREE.BoxGeometry(0.3, h, 0.3);
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.85,
      });
      const pillar = new THREE.Mesh(geo, mat);
      pillar.position.set((i - 1.5) * 0.65, h / 2 - 0.6, 0);
      group.add(pillar);
      pillars.push(pillar);
    }

    // Laser connection rail connecting pillars
    const linePoints: THREE.Vector3[] = [];
    pillars.forEach((p) => {
      linePoints.push(new THREE.Vector3(p.position.x, p.position.y + 0.35, p.position.z));
    });

    const railGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const railMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    group.add(new THREE.Line(railGeo, railMat));

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

      group.rotation.y = elapsed * 0.35 + mouseX * 0.4;
      group.rotation.x = 0.2 + mouseY * 0.3;

      pillars.forEach((p, idx) => {
        p.position.y = (0.5 + idx * 0.35) / 2 - 0.6 + Math.sin(elapsed * 2 + idx) * 0.05;
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
        <span className="text-[9px] font-mono tracking-widest text-[#FFD600] uppercase font-bold px-2 py-0.5 rounded-full bg-black/60 border border-[#FFD600]/30 shadow-sm">
          // 3D STRATEGY TIMELINE
        </span>
      </div>
    </div>
  );
};
