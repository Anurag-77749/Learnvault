import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeGlassSphere: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 2.2);
    dirLight2.position.set(-6, -4, -3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 3.5, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // 1. Pedestal / Plinth
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.45, 0.35, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xe0e7ff,
      roughness: 0.25,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.15;
    scene.add(pedestal);

    // Pedestal glow ring
    const ringGeo = new THREE.TorusGeometry(1.42, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.98;
    scene.add(ring);

    // 2. Central Glossy Iridescent Blue Sphere
    const sphereGeo = new THREE.SphereGeometry(0.72, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.2,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = 0.05;
    scene.add(sphere);

    // 3. Two Interlocking Glass Torus Rings
    const torusGeo1 = new THREE.TorusGeometry(1.25, 0.065, 32, 100);
    const glassMat1 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.5,
      specularIntensity: 1.2,
    });
    const torus1 = new THREE.Mesh(torusGeo1, glassMat1);
    torus1.rotation.x = Math.PI / 3.2;
    torus1.rotation.y = Math.PI / 6;
    torus1.position.y = 0.05;
    scene.add(torus1);

    const torusGeo2 = new THREE.TorusGeometry(1.15, 0.055, 32, 100);
    const glassMat2 = new THREE.MeshPhysicalMaterial({
      color: 0xe0e7ff,
      transmission: 0.94,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.5,
      thickness: 0.45,
      specularIntensity: 1.4,
    });
    const torus2 = new THREE.Mesh(torusGeo2, glassMat2);
    torus2.rotation.x = -Math.PI / 3.8;
    torus2.rotation.z = Math.PI / 4;
    torus2.position.y = 0.05;
    scene.add(torus2);

    // 4. Tiny Companion Floating Sphere
    const smallSphereGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const smallSphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
    });
    const smallSphere = new THREE.Mesh(smallSphereGeo, smallSphereMat);
    smallSphere.position.set(-1.3, 0.2, -0.6);
    scene.add(smallSphere);

    // Mouse tilt interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow elegant rotation of glass rings
      torus1.rotation.z = elapsed * 0.35;
      torus1.rotation.y = Math.PI / 6 + Math.sin(elapsed * 0.4) * 0.15;

      torus2.rotation.y = -elapsed * 0.3;
      torus2.rotation.x = -Math.PI / 3.8 + Math.cos(elapsed * 0.35) * 0.12;

      // Gentle sphere floating
      sphere.position.y = 0.05 + Math.sin(elapsed * 1.5) * 0.06;
      smallSphere.position.y = 0.2 + Math.cos(elapsed * 1.8) * 0.08;

      // Subtle mouse tracking
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (0.8 + mouseY * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={`w-full h-full min-h-[260px] sm:min-h-[340px] flex items-center justify-center ${className}`} />;
};
