import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CinematicCanvas3D
 * Doctor Strange & Wanda Maximoff Multiverse 3D Voyage:
 * - Zone 1 (Hero): Eldritch Amber Spores & Floating Horizon
 * - Zone 2 (Bio Reveal): Wanda Crimson Chaos Smoke & Mystic Portal
 * - Zone 3 (Cyber Defense): Astral Cyan Sigils & Eldritch Runes
 * - Zone 4 (3D Obsidian Gallery): Deep Cosmic Space, Rotating Planet & Golden Mandala Rings
 * - Zone 5 (Contact & Uplink): Dimensional Multiverse Portal
 * Includes dynamic camera progression and portal transitions on scroll.
 */
interface CinematicCanvas3DProps {
  isPaused?: boolean;
}

export const CinematicCanvas3D: React.FC<CinematicCanvas3DProps> = ({ isPaused = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- SCENE SETUP ---
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !prefersReducedMotion,
        powerPreference: 'high-performance',
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL is not supported or failed to initialize in CinematicCanvas3D:', e);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.025);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 16);

    // --- MYSTIC LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x070b19, 1.4);
    scene.add(ambientLight);

    // Doctor Strange Eldritch Amber/Gold Light
    const eldritchLight = new THREE.PointLight(0xf59e0b, 5.5, 60);
    eldritchLight.position.set(-8, 6, 8);
    scene.add(eldritchLight);

    // Wanda Scarlet/Violet Chaos Light
    const chaosLight = new THREE.PointLight(0xe11d48, 5.2, 60);
    chaosLight.position.set(8, -5, 7);
    scene.add(chaosLight);

    // Astral Rim
    const cyanLight = new THREE.DirectionalLight(0x06b6d4, 1.3);
    cyanLight.position.set(0, 16, 12);
    scene.add(cyanLight);

    // --- 1. MYSTIC DUST & SPARKS CLOUD ---
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 120 : 250;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    const colorGold = new THREE.Color(0xf59e0b);
    const colorAmber = new THREE.Color(0xfbbf24);
    const colorScarlet = new THREE.Color(0xe11d48);
    const colorViolet = new THREE.Color(0xa855f7);
    const colorCyan = new THREE.Color(0x06b6d4);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 55;
      posArray[i + 1] = (Math.random() - 0.5) * 80;
      posArray[i + 2] = (Math.random() - 0.5) * 45;

      const rand = Math.random();
      const chosenColor =
        rand > 0.65 ? colorGold : rand > 0.4 ? colorScarlet : rand > 0.25 ? colorAmber : rand > 0.12 ? colorViolet : colorCyan;

      colorArray[i] = chosenColor.r;
      colorArray[i + 1] = chosenColor.g;
      colorArray[i + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Particle Texture via Canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 48;
    pCanvas.height = 48;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(251, 191, 36, 0.9)');
      grad.addColorStop(0.65, 'rgba(225, 29, 72, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 48, 48);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.6 : 0.75,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 2. DOCTOR STRANGE ROTATING ELDRITCH MANDALA PORTAL ---
    const portalGroup = new THREE.Group();
    scene.add(portalGroup);

    const eldritchMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const scarletMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });

    // Outer Runic Torus
    const portalRing1 = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.05, 12, 100), eldritchMat);
    portalGroup.add(portalRing1);

    // Concentric Inner Star Ring
    const portalRing2 = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.045, 12, 80), scarletMat);
    portalRing2.rotation.x = Math.PI / 4;
    portalGroup.add(portalRing2);

    // 8-Spoke Arcane Star
    const starGeo = new THREE.RingGeometry(3.5, 3.65, 8);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const mandalaStar = new THREE.Mesh(starGeo, starMat);
    portalGroup.add(mandalaStar);

    // Outer Horizon Ring
    const portalRing3 = new THREE.Mesh(new THREE.TorusGeometry(12.0, 0.035, 12, 120), eldritchMat);
    portalRing3.rotation.y = Math.PI / 3;
    portalGroup.add(portalRing3);

    portalGroup.position.set(0, -9, -4);

    // --- 3. WANDA CHAOS SMOKE / MIST DISCS ---
    const smokeGroup = new THREE.Group();
    scene.add(smokeGroup);

    const sCanvas = document.createElement('canvas');
    sCanvas.width = 64;
    sCanvas.height = 64;
    const sCtx = sCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 32);
      grad.addColorStop(0, 'rgba(225, 29, 72, 0.55)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const smokeTexture = new THREE.CanvasTexture(sCanvas);

    const smokeMat = new THREE.MeshBasicMaterial({
      map: smokeTexture,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const smokePlanes: THREE.Mesh[] = [];
    for (let i = 0; i < (isMobile ? 4 : 7); i++) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), smokeMat);
      plane.position.set(
        (Math.random() - 0.5) * 16,
        -12 + (Math.random() - 0.5) * 18,
        -5 + (Math.random() - 0.5) * 6
      );
      smokeGroup.add(plane);
      smokePlanes.push(plane);
    }

    // --- 4. CELESTIAL OBSIDIAN PLANET IN GALLERY ZONE ---
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const planetGeo = new THREE.SphereGeometry(6.5, 40, 40);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x050814,
      roughness: 0.35,
      metalness: 0.9,
      wireframe: true,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.14,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planetMesh);

    // Golden Planet Ring (Doctor Strange Aura)
    const planetRingGeo = new THREE.TorusGeometry(9.6, 0.045, 16, 120);
    const planetRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.38,
    });
    const planetRing = new THREE.Mesh(planetRingGeo, planetRingMat);
    planetRing.rotation.x = Math.PI / 3;
    planetGroup.add(planetRing);

    planetGroup.position.set(15, -24, -12);

    // --- 5. SCROLL PROGRESS TRACKING ---
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        targetScrollProgress = Math.min(Math.max(window.scrollY / docHeight, 0), 1);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 6. ANIMATION & RENDER TICK ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isPausedRef.current) return;
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        currentScrollProgress = THREE.MathUtils.lerp(
          currentScrollProgress,
          targetScrollProgress,
          0.06
        );
      } else {
        currentScrollProgress = targetScrollProgress;
      }

      const p = currentScrollProgress;

      // Gentle floating camera
      const idleX = Math.sin(elapsed * 0.35) * 0.3;
      const idleY = Math.cos(elapsed * 0.28) * 0.22;

      // 3D Voyage: camera moves down and pulls back/forward across portals
      camera.position.x = idleX + Math.sin(p * Math.PI * 1.5) * 2.6;
      camera.position.y = idleY - p * 34;
      camera.position.z = 16 - Math.sin(p * Math.PI) * 4.2;
      camera.lookAt(0, -p * 34, 0);

      // Rotate Doctor Strange Eldritch Portal rings & Mandala
      portalRing1.rotation.z = elapsed * 0.14;
      portalRing2.rotation.z = -elapsed * 0.2;
      portalRing3.rotation.z = elapsed * 0.09;
      mandalaStar.rotation.z = elapsed * 0.16;
      portalGroup.position.y = -p * 30 + Math.sin(elapsed * 0.8) * 0.4;

      // Rotate smoke planes
      smokePlanes.forEach((plane, i) => {
        plane.rotation.z = elapsed * (0.05 + i * 0.02);
      });
      smokeGroup.position.y = -p * 26;

      // Rotate Obsidian Planet in gallery zone
      planetMesh.rotation.y = elapsed * 0.07;
      planetMesh.rotation.x = elapsed * 0.035;
      planetRing.rotation.z = elapsed * 0.05;
      planetGroup.position.x = 13 - Math.sin(p * Math.PI) * 6.5;
      planetGroup.position.y = -p * 34 + 2;

      // Drift particle cloud
      particles.rotation.y = elapsed * 0.025 + p * 0.75;
      particles.position.y = -p * 22;

      // Dynamic light color theme shifting across zones
      if (p < 0.22) {
        // Hero: Doctor Strange Eldritch Amber & Scarlet
        eldritchLight.color.setHex(0xf59e0b);
        chaosLight.color.setHex(0xe11d48);
        eldritchLight.intensity = 5.2;
        chaosLight.intensity = 4.2;
      } else if (p < 0.42) {
        // About & Bio Reveal: Wanda Scarlet & Deep Violet
        eldritchLight.color.setHex(0xe11d48);
        chaosLight.color.setHex(0xa855f7);
        eldritchLight.intensity = 4.6;
        chaosLight.intensity = 5.0;
      } else if (p < 0.62) {
        // Cyber: Astral Cyan & Eldritch Gold
        eldritchLight.color.setHex(0x06b6d4);
        chaosLight.color.setHex(0xfbbf24);
        eldritchLight.intensity = 4.8;
        chaosLight.intensity = 4.0;
      } else if (p < 0.82) {
        // Obsidian Gallery: Cosmic Gold & Wanda Crimson
        eldritchLight.color.setHex(0xfbbf24);
        chaosLight.color.setHex(0xbe123c);
        eldritchLight.intensity = 4.6;
        chaosLight.intensity = 4.4;
      } else {
        // Multiverse Gateway
        eldritchLight.color.setHex(0xf59e0b);
        chaosLight.color.setHex(0xe11d48);
        eldritchLight.intensity = 5.2;
        chaosLight.intensity = 5.0;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      portalRing1.geometry.dispose();
      portalRing2.geometry.dispose();
      portalRing3.geometry.dispose();
      starGeo.dispose();
      starMat.dispose();
      eldritchMat.dispose();
      scarletMat.dispose();
      smokeTexture.dispose();
      smokeMat.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      planetRingGeo.dispose();
      planetRingMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
