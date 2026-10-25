import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HoloRing3DProps {
  isSquad: boolean;
  size?: number; // size in pixels, e.g. 190, 220, 260
  fxLevel?: 'high' | 'low' | 'minimal';
}

export const HoloRing3D: React.FC<HoloRing3DProps> = ({
  isSquad,
  size = 220,
  fxLevel = 'high',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetRotation = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current || fxLevel === 'minimal') return;

    const container = mountRef.current;
    const canvasSize = size + 80; // Margin for glow rings
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: fxLevel === 'high',
        powerPreference: 'high-performance',
      });
      renderer.setSize(canvasSize, canvasSize);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
    } catch (webglErr) {
      console.warn('WebGL initialization failed for HoloRing3D:', webglErr);
      return;
    }

    const group = new THREE.Group();
    scene.add(group);

    // Primary & Accent Colors
    const primaryHex = isSquad ? 0xffb53d : 0x00f2fe; // Gold or Cyan
    const accentHex = isSquad ? 0xff7a2f : 0x9b5cff;  // Flame Orange or Neon Purple
    const edgeHex = isSquad ? 0x00f2fe : 0xffb53d;    // Counter accent (Cyan for squad, Gold for others)

    // 1. Ring 1: Tilted on X-axis by ~72° (rotates in ~9s)
    const ring1Geo = new THREE.TorusGeometry(1.48, 0.018, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: primaryHex,
      transparent: true,
      opacity: 0.9,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = THREE.MathUtils.degToRad(72);
    ring1.position.z = -0.15;
    group.add(ring1);

    // 2. Ring 2: Tilted on Y-axis by ~72° (rotates in ~13s)
    const ring2Geo = new THREE.TorusGeometry(1.58, 0.016, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.85,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = THREE.MathUtils.degToRad(72);
    ring2.position.z = -0.25;
    group.add(ring2);

    // 3. Ring 3: Reverse rotating dotted/sparkling ring tilted at X: 60°, Y: 25° (rotates in ~7s)
    const ring3Group = new THREE.Group();
    ring3Group.rotation.x = THREE.MathUtils.degToRad(60);
    ring3Group.rotation.y = THREE.MathUtils.degToRad(25);
    ring3Group.position.z = 0.12;

    const ring3Geo = new THREE.TorusGeometry(1.34, 0.01, 12, 32);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: edgeHex,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Group.add(ring3);

    // Dotted Sparkle Nodes on Ring 3
    const nodeCount = 12;
    const nodeGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: edgeHex });
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.x = Math.cos(angle) * 1.34;
      node.position.y = Math.sin(angle) * 1.34;
      ring3Group.add(node);
    }
    group.add(ring3Group);

    let animationFrameId: number;
    let lastTime = performance.now();

    // Parallax damping
    let currentRotX = 0;
    let currentRotY = 0;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Rotations matching exact period:
      // Ring 1: 9s full rotation => 2*PI / 9 rad/s
      ring1.rotation.z += ((2 * Math.PI) / 9) * delta;
      // Ring 2: 13s full rotation => 2*PI / 13 rad/s
      ring2.rotation.z += ((2 * Math.PI) / 13) * delta;
      // Ring 3: 7s reverse rotation => -2*PI / 7 rad/s
      ring3Group.rotation.z -= ((2 * Math.PI) / 7) * delta;

      // Smooth mouse / tilt parallax damping
      currentRotX += (targetRotation.current.x - currentRotX) * 0.08;
      currentRotY += (targetRotation.current.y - currentRotY) * 0.08;
      group.rotation.x = currentRotX;
      group.rotation.y = currentRotY;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Pointer move listener on container for subtle 3D tilt
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotation.current = {
        x: -y * 0.45,
        y: x * 0.45,
      };
    };

    const handlePointerLeave = () => {
      targetRotation.current = { x: 0, y: 0 };
    };

    const parentEl = container.parentElement;
    if (parentEl) {
      parentEl.addEventListener('pointermove', handlePointerMove);
      parentEl.addEventListener('pointerleave', handlePointerLeave);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (parentEl) {
        parentEl.removeEventListener('pointermove', handlePointerMove);
        parentEl.removeEventListener('pointerleave', handlePointerLeave);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      renderer.dispose();
    };
  }, [isSquad, size, fxLevel]);

  return (
    <div
      ref={mountRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
      style={{
        width: `${size + 80}px`,
        height: `${size + 80}px`,
      }}
      aria-hidden="true"
    />
  );
};
