import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeKnowledgeGalaxy3DProps {
  className?: string;
  size?: number;
}

export const ThreeKnowledgeGalaxy3D: React.FC<ThreeKnowledgeGalaxy3DProps> = ({
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
    camera.position.set(0, 1.5, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Core: High-Refractive Octahedron
    const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      emissive: 0xaa7700,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 2. 6 Major Track Hub Stars
    const trackColors = [0x00f59b, 0xffd600, 0xff3366, 0x38bdf8, 0xa855f7, 0xf97316];
    const hubSpheres: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 1.35;
      const y = Math.sin(i * 1.5) * 0.35;

      const hubGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const hubMat = new THREE.MeshStandardMaterial({
        color: trackColors[i],
        emissive: trackColors[i],
        emissiveIntensity: 0.8,
      });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      group.add(hub);
      hubSpheres.push(hub);

      // Line from center core to hub
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        hub.position,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: trackColors[i],
        transparent: true,
        opacity: 0.4,
      });
      group.add(new THREE.Line(lineGeo, lineMat));
    }

    // 3. 100 Orbiting Topic Micro-Stars
    const starCount = 80;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const rad = 0.8 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.6;

      starPos[i * 3] = rad * Math.cos(theta) * Math.cos(phi);
      starPos[i * 3 + 1] = rad * Math.sin(phi);
      starPos[i * 3 + 2] = rad * Math.sin(theta) * Math.cos(phi);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    group.add(stars);

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

      group.rotation.y = elapsed * 0.25 + mouseX * 0.4;
      group.rotation.x = mouseY * 0.3;

      core.rotation.y = -elapsed * 0.6;
      core.rotation.x = elapsed * 0.3;

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
          // 3D KNOWLEDGE GALAXY
        </span>
      </div>
    </div>
  );
};
