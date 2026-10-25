import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Lens3DViewerProps {
  brandColor: string;
  accentGlow: string;
  isInteractive?: boolean;
}

/**
 * Lens3DViewer
 * Three.js Realistic 3D Optical Lens with:
 * - Convex glass curvature and refractive inner ring
 * - Chamfered champagne-gold / polished silver bezel
 * - Dynamic caustics & reflections
 * - Subtle gyroscopic mouse/touch tracking
 */
export const Lens3DViewer: React.FC<Lens3DViewerProps> = ({
  brandColor,
  accentGlow,
  isInteractive = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const colorRef = useRef(brandColor);

  useEffect(() => {
    colorRef.current = brandColor;
  }, [brandColor]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Subtle Apple-style studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2); // Warm champagne tint
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf1f5f9, 2.4); // Cool soft silver rim
    rimLight.position.set(-4, -3, 3);
    scene.add(rimLight);

    // Central Lens Mesh Group
    const lensGroup = new THREE.Group();
    scene.add(lensGroup);

    // 1. Outer Champagne-Gold Bezel Ring (Machined Metallic)
    const bezelGeo = new THREE.TorusGeometry(1.68, 0.09, 32, 128);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0xdfd5c6, // Warm silver-gold
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x222222,
    });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    lensGroup.add(bezel);

    // 2. Inner Metallic Reticle Ring
    const innerRingGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 96);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xc8b89e,
      metalness: 0.85,
      roughness: 0.25,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    lensGroup.add(innerRing);

    // 3. Convex Glass Lens Element (Optical Glassmorphism)
    const lensGeo = new THREE.SphereGeometry(1.48, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.35);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.08,
      transmission: 0.9, // Realistic glass transmission
      ior: 1.52, // Optical Crown Glass index
      thickness: 0.8,
      specularIntensity: 1.0,
      specularColor: 0xffffff,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.75,
    });
    const lensCap = new THREE.Mesh(lensGeo, lensMat);
    lensCap.rotation.x = Math.PI / 2;
    lensGroup.add(lensCap);

    // 4. Subtle Internal Brand Glow Ring (Updates dynamically with selected technology)
    const brandRingGeo = new THREE.RingGeometry(1.25, 1.45, 64);
    const brandRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(brandColor),
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const brandRing = new THREE.Mesh(brandRingGeo, brandRingMat);
    brandRing.position.z = -0.15;
    lensGroup.add(brandRing);

    // 5. 8 Micro Optical Reticle Ticks around the rim
    const ticksGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const tickGeo = new THREE.BoxGeometry(0.04, 0.12, 0.02);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.7 });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(Math.cos(angle) * 1.58, Math.sin(angle) * 1.58, 0.02);
      tick.rotation.z = angle;
      ticksGroup.add(tick);
    }
    lensGroup.add(ticksGroup);

    // Pointer Interactive Float
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!isInteractive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.35;
      targetRotX = -y * 0.35;
    };

    const handlePointerLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    window.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth lerp to mouse
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      lensGroup.rotation.x = currentRotX + Math.sin(elapsed * 0.8) * 0.04;
      lensGroup.rotation.y = currentRotY + Math.cos(elapsed * 0.7) * 0.04;

      // Update brand color smoothly
      if (brandRingMat.color.getHexString() !== new THREE.Color(colorRef.current).getHexString()) {
        brandRingMat.color.set(colorRef.current);
      }

      // Gentle rotation on ticks
      ticksGroup.rotation.z = elapsed * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      bezelGeo.dispose();
      bezelMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      lensGeo.dispose();
      lensMat.dispose();
      brandRingGeo.dispose();
      brandRingMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [isInteractive]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full pointer-events-none select-none flex items-center justify-center"
      style={{
        filter: `drop-shadow(0 15px 35px ${accentGlow})`,
      }}
    />
  );
};
