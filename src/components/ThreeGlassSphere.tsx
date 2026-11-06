import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeGlassSphereProps {
  className?: string;
  size?: number;
}

export const ThreeGlassSphere: React.FC<ThreeGlassSphereProps> = ({ className = '', size }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size || container.clientWidth || 360;
    const height = size || container.clientHeight || 360;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting (Zero blue/purple slop - clean metallic & electric amber lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff5500, 3.2);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xff7722, 2.5, 8);
    pointLight.position.set(0, 1.5, 2);
    scene.add(pointLight);

    // 3. Central Smoked Obsidian / Liquid Mirror Sphere
    const sphereGeo = new THREE.SphereGeometry(0.75, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x141418,
      emissive: 0x1c0e06,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = 0.05;
    scene.add(sphere);

    // Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    innerSphere.position.y = 0.05;
    scene.add(innerSphere);

    // 4. Interlocking Aerospace Gyro Rings
    // Ring 1: Brushed Titanium Gyro
    const ringGeo1 = new THREE.TorusGeometry(1.25, 0.045, 32, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xe6e6ea,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3.2;
    ring1.rotation.y = Math.PI / 6;
    ring1.position.y = 0.05;
    scene.add(ring1);

    // Ring 2: Smoked Glass Specular Ring
    const ringGeo2 = new THREE.TorusGeometry(1.15, 0.038, 32, 100);
    const ringMat2 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.4,
      specularIntensity: 1.5,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3.8;
    ring2.rotation.z = Math.PI / 4;
    ring2.position.y = 0.05;
    scene.add(ring2);

    // Ring 3: Electric Laser Ring
    const laserGeo = new THREE.TorusGeometry(1.45, 0.015, 16, 100);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.85,
    });
    const laserRing = new THREE.Mesh(laserGeo, laserMat);
    laserRing.rotation.x = Math.PI / 2;
    laserRing.position.y = 0.05;
    scene.add(laserRing);

    // 5. Floating Orbital Stardust Particles
    const particlesCount = 90;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 1.3 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      posArray[i] = radius * Math.cos(theta) * Math.cos(phi);
      posArray[i + 1] = radius * Math.sin(phi);
      posArray[i + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Mouse Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = size || container.clientWidth || 360;
      const h = size || container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Fluid orbital rotations
      ring1.rotation.z = elapsed * 0.35;
      ring1.rotation.y = Math.PI / 6 + Math.sin(elapsed * 0.4) * 0.18;

      ring2.rotation.y = -elapsed * 0.3;
      ring2.rotation.x = -Math.PI / 3.8 + Math.cos(elapsed * 0.35) * 0.15;

      laserRing.rotation.z = elapsed * 0.25;

      // Inner pulsating core
      innerSphere.rotation.x = elapsed * 0.5;
      innerSphere.rotation.y = elapsed * 0.6;
      const scalePulse = 1 + Math.sin(elapsed * 3) * 0.05;
      innerSphere.scale.set(scalePulse, scalePulse, scalePulse);

      // Sphere floating physics
      sphere.position.y = 0.05 + Math.sin(elapsed * 1.6) * 0.06;
      innerSphere.position.y = sphere.position.y;

      // Particle orbit drift
      particles.rotation.y = elapsed * 0.08;

      // Smooth mouse interpolation (Lerp)
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      camera.position.x = currentMouseX * 0.8;
      camera.position.y = 0.5 + currentMouseY * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, [size]);

  return (
    <div 
      ref={mountRef} 
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`} 
    />
  );
};
