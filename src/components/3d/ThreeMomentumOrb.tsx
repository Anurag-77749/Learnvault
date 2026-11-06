import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeMomentumOrbProps {
  className?: string;
  size?: number;
  studyMinutes?: number;
}

export const ThreeMomentumOrb: React.FC<ThreeMomentumOrbProps> = ({
  className = '',
  size = 220,
  studyMinutes = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffd600, 2.5);
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x00f59b, 2.0);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // 1. Central Core: Frosted Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x18181f,
      emissive: 0x221a00,
      emissiveIntensity: 0.4,
      roughness: 0.15,
      metalness: 0.9,
      clearcoat: 1.0,
      wireframe: false,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Wireframe Cage
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffd600,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireCage = new THREE.Mesh(coreGeo, wireMat);
    wireCage.scale.setScalar(1.02);
    core.add(wireCage);

    // 2. Gyroscope Rings
    const ringGeo1 = new THREE.TorusGeometry(1.15, 0.02, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.35, 0.016, 16, 64);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x00f59b,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x00a86b,
      emissiveIntensity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    scene.add(ring2);

    // 3. Orbiting Particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 1.45 + Math.random() * 0.45;
      positions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = rad * Math.cos(phi);
      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd600,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouse);

    // Animation Loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Spin Core
      core.rotation.y = elapsedTime * 0.4 + mouseX * 0.4;
      core.rotation.x = elapsedTime * 0.25 + mouseY * 0.4;

      // Gyro Rings Spin
      ring1.rotation.x = elapsedTime * 0.7;
      ring1.rotation.y = elapsedTime * 0.35;
      ring2.rotation.y = -elapsedTime * 0.6;
      ring2.rotation.z = elapsedTime * 0.4;

      // Particles orbit
      particles.rotation.y = elapsedTime * 0.2;
      particles.rotation.x = Math.sin(elapsedTime * 0.15) * 0.15;

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
          // 3D MOMENTUM GYRO
        </span>
      </div>
    </div>
  );
};
