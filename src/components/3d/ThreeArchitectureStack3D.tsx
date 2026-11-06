import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeArchitectureStack3DProps {
  className?: string;
  size?: number;
}

export const ThreeArchitectureStack3D: React.FC<ThreeArchitectureStack3DProps> = ({
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
    camera.position.set(2.8, 2.2, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const group = new THREE.Group();
    scene.add(group);

    // 3 Floating Architecture Slabs (Frontend -> API -> DB)
    const slabColors = [0x38bdf8, 0xffd600, 0x00f59b];
    const slabs: THREE.Mesh[] = [];

    const slabGeo = new THREE.BoxGeometry(1.6, 0.1, 1.6);

    for (let i = 0; i < 3; i++) {
      const slabMat = new THREE.MeshPhysicalMaterial({
        color: 0x181820,
        emissive: slabColors[i],
        emissiveIntensity: 0.25,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.9,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = (i - 1) * 0.55;
      group.add(slab);
      slabs.push(slab);

      // Wireframe edge
      const edgeMat = new THREE.MeshBasicMaterial({
        color: slabColors[i],
        wireframe: true,
      });
      const edge = new THREE.Mesh(slabGeo, edgeMat);
      edge.scale.setScalar(1.01);
      slab.add(edge);
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

      group.rotation.y = elapsed * 0.35 + mouseX * 0.4;
      group.rotation.x = Math.sin(elapsed * 0.25) * 0.1 + mouseY * 0.3;

      // Floating float oscillation
      slabs.forEach((slab, i) => {
        slab.position.y = (i - 1) * 0.55 + Math.sin(elapsed * 2 + i) * 0.05;
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
        <span className="text-[9px] font-mono tracking-widest text-[#38BDF8] uppercase font-bold px-2 py-0.5 rounded-full bg-black/60 border border-[#38BDF8]/30 shadow-sm">
          // 3D ARCHITECTURE STACK
        </span>
      </div>
    </div>
  );
};
