import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeRadarGlobe3DProps {
  className?: string;
  size?: number;
}

export const ThreeRadarGlobe3D: React.FC<ThreeRadarGlobe3DProps> = ({
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
    camera.position.set(0, 0.5, 3.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Wireframe Holographic Sphere
    const sphereGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f59b,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globe);

    // 2. Latitude Equator Ring
    const ringGeo = new THREE.RingGeometry(1.28, 1.34, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f59b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    globeGroup.add(ring);

    // 3. Rotating Radar Sweep Beam
    const sweepGeo = new THREE.ConeGeometry(1.25, 0.05, 32, 1, true, 0, Math.PI / 3);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0x00f59b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const sweep = new THREE.Mesh(sweepGeo, sweepMat);
    sweep.rotation.x = Math.PI / 2;
    globeGroup.add(sweep);

    // 4. Target Career Hub Beacons
    const hubPositions = [
      [0.6, 0.7, 0.7],    // SF / Silicon Valley
      [0.8, 0.6, 0.4],    // NYC
      [0.1, 0.4, 1.1],    // London
      [-0.7, 0.3, 0.9],   // Bangalore
      [-0.9, 0.6, 0.5],   // Tokyo
    ];

    const beaconGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xffd600,
    });

    hubPositions.forEach((pos) => {
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(pos[0], pos[1], pos[2]).normalize().multiplyScalar(1.22);
      globeGroup.add(beacon);
    });

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

      globeGroup.rotation.y = elapsed * 0.3 + mouseX * 0.4;
      globeGroup.rotation.x = 0.2 + mouseY * 0.3;
      sweep.rotation.z = -elapsed * 1.8;

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
          // 3D CAREER RADAR
        </span>
      </div>
    </div>
  );
};
