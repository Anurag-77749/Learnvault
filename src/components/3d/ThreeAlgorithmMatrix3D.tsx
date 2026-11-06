import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeAlgorithmMatrix3DProps {
  className?: string;
  size?: number;
}

export const ThreeAlgorithmMatrix3D: React.FC<ThreeAlgorithmMatrix3DProps> = ({
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

    // 1. Outer Bounding Wireframe Box
    const boxGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x33333d,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    group.add(box);

    // 2. Algorithm Tree / Matrix Nodes
    const nodeColors = [0x00f59b, 0xffd600, 0xff3366]; // Easy, Med, Hard
    const nodeSpheres: THREE.Mesh[] = [];

    // Create 3D grid points (3x3x3 sparse)
    const positions: [number, number, number][] = [
      [0, 0.7, 0],          // Root
      [-0.5, 0.2, 0.3],     // Left child
      [0.5, 0.2, -0.3],     // Right child
      [-0.7, -0.4, 0.5],    // Leaf 1
      [-0.2, -0.4, 0.1],    // Leaf 2
      [0.3, -0.4, -0.1],    // Leaf 3
      [0.7, -0.4, -0.5],    // Leaf 4
    ];

    const sphereGeo = new THREE.SphereGeometry(0.09, 16, 16);

    positions.forEach((pos, idx) => {
      const color = nodeColors[idx % nodeColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const sphere = new THREE.Mesh(sphereGeo, mat);
      sphere.position.set(...pos);
      group.add(sphere);
      nodeSpheres.push(sphere);
    });

    // 3. Connecting Laser Edges
    const lineEdges = [
      [0, 1], [0, 2],
      [1, 3], [1, 4],
      [2, 5], [2, 6]
    ];

    lineEdges.forEach(([startIdx, endIdx]) => {
      const p1 = new THREE.Vector3(...positions[startIdx]);
      const p2 = new THREE.Vector3(...positions[endIdx]);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
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

      group.rotation.y = elapsed * 0.45 + mouseX * 0.5;
      group.rotation.x = Math.sin(elapsed * 0.3) * 0.15 + mouseY * 0.4;

      // Pulse nodes
      nodeSpheres.forEach((sphere, i) => {
        const scale = 1 + Math.sin(elapsed * 2.5 + i) * 0.15;
        sphere.scale.setScalar(scale);
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
          // 3D ALGORITHM LATTICE
        </span>
      </div>
    </div>
  );
};
