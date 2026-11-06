import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeChronometer3DProps {
  className?: string;
  size?: number;
  isRunning?: boolean;
}

export const ThreeChronometer3D: React.FC<ThreeChronometer3DProps> = ({
  className = '',
  size = 220,
  isRunning = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const point = new THREE.PointLight(0xffd600, 3.0, 10);
    point.position.set(0, 0, 2);
    scene.add(point);

    // Group for whole clock
    const clockGroup = new THREE.Group();
    scene.add(clockGroup);

    // 1. Outer Beveled Dial Ring
    const dialGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 64);
    const dialMat = new THREE.MeshStandardMaterial({
      color: 0x1f2026,
      metalness: 0.95,
      roughness: 0.15,
    });
    const dialRing = new THREE.Mesh(dialGeo, dialMat);
    clockGroup.add(dialRing);

    // 2. 12 Major Hour Notches (Cylinders)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const notchGeo = new THREE.BoxGeometry(0.04, 0.16, 0.04);
      const notchMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xffd600 : 0xffffff,
      });
      const notch = new THREE.Mesh(notchGeo, notchMat);
      notch.position.set(Math.sin(angle) * 1.1, Math.cos(angle) * 1.1, 0.02);
      notch.rotation.z = -angle;
      clockGroup.add(notch);
    }

    // 3. Central Pivot Hub
    const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xaa8800,
      emissiveIntensity: 0.2,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    clockGroup.add(hub);

    // 4. Laser Sweep Hand
    const handGeo = new THREE.BoxGeometry(0.03, 0.95, 0.02);
    const handMat = new THREE.MeshBasicMaterial({
      color: 0xffd600,
    });
    const hand = new THREE.Mesh(handGeo, handMat);
    hand.position.y = 0.45;

    const handPivot = new THREE.Group();
    handPivot.add(hand);
    clockGroup.add(handPivot);

    // 5. Optical Glass Cover Disc
    const glassGeo = new THREE.CylinderGeometry(1.24, 1.24, 0.02, 48);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 0.1;
    clockGroup.add(glass);

    // Parallax Tilt
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
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation of hand
      handPivot.rotation.z = -elapsedTime * (isRunning ? 1.5 : 0.4);

      // Micro tilt
      clockGroup.rotation.x = mouseY * 0.35;
      clockGroup.rotation.y = mouseX * 0.35;

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
  }, [size, isRunning]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <div ref={mountRef} className="cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 text-center pointer-events-none">
        <span className="text-[9px] font-mono tracking-widest text-[#FFD600] uppercase font-bold px-2 py-0.5 rounded-full bg-black/60 border border-[#FFD600]/30 shadow-sm">
          // 3D CHRONOMETER
        </span>
      </div>
    </div>
  );
};
