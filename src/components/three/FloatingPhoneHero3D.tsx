import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PortfolioImage } from '../../types';
import { sound } from '../audio/SoundEffects';
import { Smartphone, Sparkles, Layers, ShieldCheck } from 'lucide-react';

interface FloatingPhoneHero3DProps {
  centralImage: PortfolioImage | null;
  orbitImages?: PortfolioImage[];
  onExplore?: () => void;
  customHeaderTag?: string;
  customHeaderSub?: string;
  customName?: string;
  customSubtitle?: string;
  customNote?: string;
  metric1?: { label: string; sub: string };
  metric2?: { label: string; sub: string };
  metric3?: { label: string; sub: string };
  isPaused?: boolean;
}

export const FloatingPhoneHero3D: React.FC<FloatingPhoneHero3DProps> = ({
  centralImage,
  orbitImages = [],
  onExplore,
  customHeaderTag,
  customHeaderSub,
  customName,
  customSubtitle,
  customNote,
  metric1,
  metric2,
  metric3,
  isPaused = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8.8);

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (/HeadlessChrome/i.test(navigator.userAgent) || (navigator as any).webdriver);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL is not supported or failed to initialize in FloatingPhoneHero3D:', e);
      return;
    }

    // Procedural Studio Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {}

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0a1020, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x06b6d4, 4.2);
    keyLight.position.set(5, 6, 7);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xa855f7, 4.8, 20);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0xec4899, 3.2, 15);
    bottomGlow.position.set(0, -6, 4);
    scene.add(bottomGlow);

    // Master Phone Pivot Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Tilted initial pose
    rootGroup.rotation.x = 0.18;
    rootGroup.rotation.y = -0.32;
    rootGroup.rotation.z = 0.08;

    // --- 1. PROCEDURAL 3D SMARTPHONE CHASSIS ---
    const phoneWidth = 3.0;
    const phoneHeight = 6.0;
    const phoneDepth = 0.28;
    const cornerRadius = 0.38;

    // Create rounded rectangular phone chassis shape
    const shape = new THREE.Shape();
    const x = -phoneWidth / 2;
    const y = -phoneHeight / 2;
    const w = phoneWidth;
    const h = phoneHeight;
    const r = cornerRadius;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: phoneDepth,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const chassisGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    chassisGeo.center();

    // Dark Titanium / Obsidian Chassis Material
    const chassisMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0f1d,
      metalness: 0.94,
      roughness: 0.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    rootGroup.add(chassisMesh);

    // Chrome Outer Perimeter Band
    const bandGeo = new THREE.BoxGeometry(phoneWidth + 0.04, phoneHeight + 0.04, phoneDepth * 0.75);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.98,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      wireframe: true,
    });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    rootGroup.add(bandMesh);

    // --- 2. SMARTPHONE DISPLAY WITH REAL/PROCEDURAL PROFILE CONTENT ---
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 2048;
    const sCtx = screenCanvas.getContext('2d')!;

    const renderScreenTexture = (imageUrl?: string) => {
      // 1. OLED Deep Dark Background
      const bgGrad = sCtx.createLinearGradient(0, 0, 0, 2048);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.3, '#070f26');
      bgGrad.addColorStop(0.7, '#0b132b');
      bgGrad.addColorStop(1, '#030712');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, 1024, 2048);

      // Cyber Matrix Grid on phone screen
      sCtx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      sCtx.lineWidth = 2;
      for (let gx = 0; gx < 1024; gx += 64) {
        sCtx.beginPath();
        sCtx.moveTo(gx, 0);
        sCtx.lineTo(gx, 2048);
        sCtx.stroke();
      }
      for (let gy = 0; gy < 2048; gy += 64) {
        sCtx.beginPath();
        sCtx.moveTo(0, gy);
        sCtx.lineTo(1024, gy);
        sCtx.stroke();
      }

      // Top Status Bar
      sCtx.font = 'bold 36px JetBrains Mono, monospace';
      sCtx.fillStyle = '#e2e8f0';
      sCtx.textAlign = 'left';
      sCtx.fillText('20:26', 80, 100);

      // Dynamic Island / Speaker Pill
      sCtx.fillStyle = '#020617';
      sCtx.beginPath();
      sCtx.roundRect(412, 60, 200, 56, 28);
      sCtx.fill();
      sCtx.lineWidth = 3;
      sCtx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      sCtx.stroke();

      // Camera lens dot inside island
      sCtx.fillStyle = '#06b6d4';
      sCtx.beginPath();
      sCtx.arc(580, 88, 10, 0, Math.PI * 2);
      sCtx.fill();

      // Right status icons (5G, Battery)
      sCtx.textAlign = 'right';
      sCtx.font = '30px JetBrains Mono, monospace';
      sCtx.fillStyle = '#38bdf8';
      sCtx.fillText('5G   100%', 944, 100);

      // Header Tagline
      sCtx.textAlign = 'center';
      sCtx.font = 'bold 34px Orbitron, sans-serif';
      sCtx.fillStyle = '#06b6d4';
      sCtx.fillText(customHeaderTag || 'AI ENGINEER NEXUS', 512, 230);
      sCtx.font = '28px Rajdhani, sans-serif';
      sCtx.fillStyle = '#94a3b8';
      sCtx.fillText(customHeaderSub || 'MOHIT YADAV // OFFICIAL CORE', 512, 280);

      // Profile Photo Frame Center
      const photoCenterX = 512;
      const photoCenterY = 740;
      const photoRadius = 340;

      // Outer holographic halo ring
      sCtx.beginPath();
      sCtx.arc(photoCenterX, photoCenterY, photoRadius + 22, 0, Math.PI * 2);
      sCtx.lineWidth = 6;
      sCtx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      sCtx.stroke();

      sCtx.beginPath();
      sCtx.arc(photoCenterX, photoCenterY, photoRadius + 38, 0, Math.PI * 2);
      sCtx.lineWidth = 2;
      sCtx.setLineDash([16, 12]);
      sCtx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      sCtx.stroke();
      sCtx.setLineDash([]);

      // Draw photo or fallback
      if (imageUrl && imageUrl.trim() !== '') {
        const cleanUrl = imageUrl.trim();
        const img = new Image();
        if (cleanUrl.startsWith('http')) {
          img.crossOrigin = 'anonymous';
        }
        img.src = cleanUrl;
        img.onload = () => {
          sCtx.save();
          sCtx.beginPath();
          sCtx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
          sCtx.closePath();
          sCtx.clip();
          sCtx.drawImage(
            img,
            photoCenterX - photoRadius,
            photoCenterY - photoRadius,
            photoRadius * 2,
            photoRadius * 2
          );
          sCtx.restore();

          // Border ring around photo
          sCtx.beginPath();
          sCtx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
          sCtx.lineWidth = 12;
          sCtx.strokeStyle = '#06b6d4';
          sCtx.stroke();
          screenTexture.needsUpdate = true;
        };
        img.onerror = () => {
          drawProceduralAvatar(sCtx, photoCenterX, photoCenterY, photoRadius);
          screenTexture.needsUpdate = true;
        };
      } else {
        drawProceduralAvatar(sCtx, photoCenterX, photoCenterY, photoRadius);
      }

      // Name & Title directly on screen
      sCtx.font = '900 68px Orbitron, sans-serif';
      sCtx.fillStyle = '#ffffff';
      sCtx.textAlign = 'center';
      sCtx.fillText((customName || 'MOHIT YADAV').toUpperCase(), 512, 1220);

      sCtx.font = '600 36px Rajdhani, sans-serif';
      sCtx.fillStyle = '#38bdf8';
      sCtx.fillText(customSubtitle || 'Class 12 Science (BSEB)   Python Developer', 512, 1290);

      sCtx.font = '32px Rajdhani, sans-serif';
      sCtx.fillStyle = '#c084fc';
      sCtx.fillText(customNote || 'Future AI Engineer & Tech Innovator', 512, 1345);

      // Metric highlights strip on phone
      const cardY = 1440;
      sCtx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      sCtx.beginPath();
      sCtx.roundRect(80, cardY, 864, 210, 24);
      sCtx.fill();
      sCtx.lineWidth = 2;
      sCtx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      sCtx.stroke();

      // Metric 1
      sCtx.textAlign = 'center';
      sCtx.font = 'bold 44px Orbitron, sans-serif';
      sCtx.fillStyle = '#06b6d4';
      sCtx.fillText(metric1?.label || 'PYTHON', 224, cardY + 90);
      sCtx.font = '24px JetBrains Mono, monospace';
      sCtx.fillStyle = '#94a3b8';
      sCtx.fillText(metric1?.sub || 'CORE & DEV', 224, cardY + 145);

      // Divider
      sCtx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      sCtx.beginPath();
      sCtx.moveTo(368, cardY + 30);
      sCtx.lineTo(368, cardY + 180);
      sCtx.stroke();

      // Metric 2
      sCtx.font = 'bold 44px Orbitron, sans-serif';
      sCtx.fillStyle = '#ec4899';
      sCtx.fillText(metric2?.label || '6 ACTIVE', 512, cardY + 90);
      sCtx.font = '24px JetBrains Mono, monospace';
      sCtx.fillStyle = '#94a3b8';
      sCtx.fillText(metric2?.sub || 'PROJECTS', 512, cardY + 145);

      // Divider
      sCtx.beginPath();
      sCtx.moveTo(656, cardY + 30);
      sCtx.lineTo(656, cardY + 180);
      sCtx.stroke();

      // Metric 3
      sCtx.font = 'bold 44px Orbitron, sans-serif';
      sCtx.fillStyle = '#a855f7';
      sCtx.fillText(metric3?.label || 'AI ENG', 800, cardY + 90);
      sCtx.font = '24px JetBrains Mono, monospace';
      sCtx.fillStyle = '#94a3b8';
      sCtx.fillText(metric3?.sub || 'HORIZON', 800, cardY + 145);

      // Bottom Home Indicator Bar
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      sCtx.beginPath();
      sCtx.roundRect(372, 1960, 280, 10, 5);
      sCtx.fill();
    };

    const drawProceduralAvatar = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      rad: number
    ) => {
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, rad);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.7, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();

      // Stylized head & shoulders silhouette
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(cx, cy - 50, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + 240, 220, Math.PI, 0);
      ctx.fill();

      // Cyan visor line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 70, cy - 65, 140, 16);
    };

    renderScreenTexture(centralImage?.downloadUrl);
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Screen Mesh slightly in front of chassis
    const screenGeo = new THREE.PlaneGeometry(phoneWidth - 0.16, phoneHeight - 0.22);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      transparent: true,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = phoneDepth / 2 + 0.055;
    rootGroup.add(screenMesh);

    // Front Glass Bevel
    const glassGeo = new THREE.PlaneGeometry(phoneWidth - 0.12, phoneHeight - 0.18);
    const glassMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = phoneDepth / 2 + 0.06;
    rootGroup.add(glassMesh);

    // Camera Module on Back
    const camBumpGeo = new THREE.BoxGeometry(1.0, 1.2, 0.08);
    const camBumpMat = new THREE.MeshStandardMaterial({
      color: 0x050814,
      metalness: 0.95,
      roughness: 0.2,
    });
    const camBump = new THREE.Mesh(camBumpGeo, camBumpMat);
    camBump.position.set(-0.75, 1.9, -phoneDepth / 2 - 0.04);
    rootGroup.add(camBump);

    // 3 Camera Lenses
    for (let c = 0; c < 3; c++) {
      const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32);
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
      });
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.rotation.x = Math.PI / 2;
      const lx = c === 2 ? 0.22 : -0.22;
      const ly = c === 0 ? 0.32 : c === 1 ? -0.32 : 0;
      lensMesh.position.set(lx, ly, 0.04);
      camBump.add(lensMesh);
    }

    // --- 3. FLOATING 3D SATELLITE ICONS ---
    const satelliteGroup = new THREE.Group();
    rootGroup.add(satelliteGroup);

    interface SatelliteDef {
      name: string;
      color: number;
      pos: [number, number, number];
      iconType: 'photo' | 'skill' | 'project' | 'contact';
    }

    const satellites: SatelliteDef[] = [
      { name: 'PHOTOS', color: 0x06b6d4, pos: [-2.4, 1.8, 1.1], iconType: 'photo' },
      { name: 'SKILLS', color: 0xa855f7, pos: [2.5, 1.6, 0.9], iconType: 'skill' },
      { name: 'PROJECTS', color: 0xec4899, pos: [-2.5, -1.6, 1.2], iconType: 'project' },
      { name: 'CONTACT', color: 0x10b981, pos: [2.4, -1.8, 0.8], iconType: 'contact' },
    ];

    const createSatelliteTexture = (
      name: string,
      colorHex: string,
      photoUrl?: string
    ): THREE.CanvasTexture => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;

      // Glowing circular disc
      const grad = ctx.createRadialGradient(256, 256, 80, 256, 256, 256);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(0.85, '#030712');
      grad.addColorStop(1, colorHex);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(256, 256, 240, 0, Math.PI * 2);
      ctx.fill();

      // Outer metallic neon ring
      ctx.lineWidth = 14;
      ctx.strokeStyle = colorHex;
      ctx.stroke();

      if (photoUrl && photoUrl.trim() !== '') {
        const cleanPhoto = photoUrl.trim();
        const img = new Image();
        if (cleanPhoto.startsWith('http')) img.crossOrigin = 'anonymous';
        img.src = cleanPhoto;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(256, 256, 224, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, 32, 32, 448, 448);
          ctx.restore();

          // Border ring around photo
          ctx.beginPath();
          ctx.arc(256, 256, 224, 0, Math.PI * 2);
          ctx.lineWidth = 14;
          ctx.strokeStyle = colorHex;
          ctx.stroke();

          // Subtle title pill at bottom
          ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
          ctx.beginPath();
          ctx.roundRect(64, 400, 384, 80, 20);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = colorHex;
          ctx.stroke();

          ctx.font = 'bold 32px Orbitron, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(name.slice(0, 16).toUpperCase(), 256, 452);

          t.needsUpdate = true;
        };
      } else {
        // Label
        ctx.font = 'bold 36px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(name, 256, 270);
      }

      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const satMeshes: THREE.Mesh[] = [];
    satellites.forEach((sat, sIdx) => {
      const satGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32);
      const hexStr = `#${sat.color.toString(16).padStart(6, '0')}`;
      const orbitPhoto = orbitImages[sIdx];
      const satName = orbitPhoto?.title || orbitPhoto?.caption || sat.name;
      const satTex = createSatelliteTexture(satName, hexStr, orbitPhoto?.downloadUrl);
      const satMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.rotation.x = Math.PI / 2;
      satMesh.position.set(...sat.pos);

      // Front face plate
      const faceGeo = new THREE.CircleGeometry(0.52, 32);
      const faceMat = new THREE.MeshBasicMaterial({
        map: satTex,
        side: THREE.DoubleSide,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.position.z = 0.045;
      satMesh.add(faceMesh);

      // Connecting holographic tether beam to phone
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-sat.pos[0] * 0.7, -sat.pos[1] * 0.7, -sat.pos[2] * 0.7),
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: sat.color,
        dashSize: 0.1,
        gapSize: 0.1,
        opacity: 0.35,
        transparent: true,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      satMesh.add(lineMesh);

      satelliteGroup.add(satMesh);
      satMeshes.push(satMesh);
    });

    // --- 4. CRYSTALLINE SHATTER PARTICLES ---
    const shardCount = 48;
    const shardGroup = new THREE.Group();
    rootGroup.add(shardGroup);

    const shards: {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      velocity: THREE.Vector3;
      rotSpeed: THREE.Vector3;
    }[] = [];

    const shardGeo = new THREE.TetrahedronGeometry(0.18, 0);
    const shardMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      metalness: 0.95,
      roughness: 0.1,
      transmission: 0.75,
      thickness: 0.5,
      clearcoat: 1.0,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.2,
    });

    for (let i = 0; i < shardCount; i++) {
      const sm = new THREE.Mesh(shardGeo, shardMat);
      const radius = 2.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const basePos = new THREE.Vector3(
        radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.sin(theta) * Math.cos(phi)
      );
      sm.position.copy(basePos);
      sm.scale.setScalar(0.6 + Math.random() * 0.8);
      const velocity = basePos.clone().normalize().multiplyScalar(0.5 + Math.random() * 0.8);
      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      shardGroup.add(sm);
      shards.push({ mesh: sm, basePos, velocity, rotSpeed });
    }

    // --- 5. MOUSE & TOUCH TILT PARALLAX WITH SPRING DAMPING ---
    let pointerX = 0;
    let pointerY = 0;
    let targetTiltX = 0.18;
    let targetTiltY = -0.32;
    let scrollShatterRatio = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerX = nx;
      pointerY = ny;
      targetTiltY = -0.32 + pointerX * 0.45;
      targetTiltX = 0.18 - pointerY * 0.4;
    };

    const handleScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      scrollShatterRatio = Math.min(Math.max(sy / (vh * 0.75), 0), 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    mount.addEventListener('mousemove', onPointerMove);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isPausedRef.current) return;
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Idle levitation
      const levitateY = Math.sin(elapsed * 1.5) * 0.12;
      const levitateRotZ = Math.cos(elapsed * 1.2) * 0.025;

      // Smooth tilt damping
      if (!prefersReducedMotion) {
        rootGroup.rotation.y = THREE.MathUtils.damp(
          rootGroup.rotation.y,
          targetTiltY,
          4.0,
          delta
        );
        rootGroup.rotation.x = THREE.MathUtils.damp(
          rootGroup.rotation.x,
          targetTiltX,
          4.0,
          delta
        );
      }
      rootGroup.position.y = levitateY;
      rootGroup.rotation.z = 0.08 + levitateRotZ;

      // Scroll Shatter & Recede: Phone moves back in Z and particles expand
      const shatter = scrollShatterRatio;
      rootGroup.position.z = -shatter * 12.0;
      rootGroup.scale.setScalar(Math.max(1.0 - shatter * 0.4, 0.4));

      // Disperse satellite nodes and crystal shards outward as scroll increases
      shards.forEach(({ mesh, basePos, rotSpeed }) => {
        mesh.rotation.x += rotSpeed.x * delta;
        mesh.rotation.y += rotSpeed.y * delta;
        mesh.rotation.z += rotSpeed.z * delta;

        const explodeFactor = 1.0 + shatter * 4.0;
        mesh.position.x = basePos.x * explodeFactor + Math.sin(elapsed + basePos.y) * 0.1;
        mesh.position.y = basePos.y * explodeFactor + Math.cos(elapsed + basePos.x) * 0.1;
        mesh.position.z = basePos.z * explodeFactor;
      });

      // Satellites gentle independent wobble
      satMeshes.forEach((sat, sIdx) => {
        const offset = sIdx * 1.5;
        sat.position.y = satellites[sIdx].pos[1] + Math.sin(elapsed * 2 + offset) * 0.08;
        sat.position.z = satellites[sIdx].pos[2] + Math.cos(elapsed * 1.8 + offset) * 0.06;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousemove', onPointerMove);
      chassisGeo.dispose();
      chassisMat.dispose();
      bandGeo.dispose();
      bandMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      screenTexture.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      camBumpGeo.dispose();
      camBumpMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [
    centralImage?.id,
    centralImage?.downloadUrl,
    orbitImages.map((o) => `${o.id}_${o.downloadUrl}`).join('|'),
    customName,
    customSubtitle,
    customHeaderTag,
    customHeaderSub,
    customNote,
    metric1?.label,
    metric1?.sub,
    metric2?.label,
    metric2?.sub,
    metric3?.label,
    metric3?.sub,
  ]);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] select-none cursor-pointer flex items-center justify-center"
      title="Interactive Floating 3D Phone - Hover or tilt to inspect"
    >
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center gap-2 px-3 py-1 text-[11px] font-mono text-cyan-300/80 bg-gray-950/60 backdrop-blur-sm rounded-full">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>MOVE POINTER / SCROLL TO TRIGGER SHATTER TRANSITION</span>
      </div>
    </div>
  );
};
