import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeMemoryCrystal3DProps {
  className?: string;
  size?: number;
}

export const ThreeMemoryCrystal3D: React.FC<ThreeMemoryCrystal3DProps> = ({
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
    camera.position.set(0, 0.2, 4.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const point = new THREE.PointLight(0xa855f7, 3.5, 8);
    point.position.set(0, 2, 2);
    scene.add(point);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Faceted Memory Crystal (Dodecahedron)
    const crystalGeo = new THREE.DodecahedronGeometry(0.9, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1528,
      emissive: 0x330066,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    group.add(crystal);

    // Wireframe Cage
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireCage = new THREE.Mesh(crystalGeo, wireMat);
    wireCage.scale.setScalar(1.03);
    group.add(wireCage);

    // Floating Halo Ring
    const haloGeo = new THREE.TorusGeometry(1.3, 0.02, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 3;
    group.add(halo);

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

      group.rotation.y = elapsed * 0.4 + mouseX * 0.4;
      group.rotation.x = Math.sin(elapsed * 0.3) * 0.2 + mouseY * 0.3;
      halo.rotation.z = -elapsed * 0.5;

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
        <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase font-bold px-2 py-0.5 rounded-full bg-black/60 border border-purple-400/30 shadow-sm">
          // 3D MEMORY CRYSTAL
        </span>
      </div>
    </div>
  );
};
