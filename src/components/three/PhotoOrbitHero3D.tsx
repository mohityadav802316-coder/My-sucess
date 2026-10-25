import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sound } from '../audio/SoundEffects';
import { PortfolioImage } from '../../types';
import { Play, Pause, RotateCcw, Sparkles, Compass, Eye } from 'lucide-react';

interface PhotoOrbitHero3DProps {
  centralImage: PortfolioImage | null;
  orbitImages: PortfolioImage[];
  cycleInterval?: number; // in seconds
  onSelectPhoto?: (image: PortfolioImage) => void;
}

export const PhotoOrbitHero3D: React.FC<PhotoOrbitHero3DProps> = ({
  centralImage,
  orbitImages,
  cycleInterval = 2.5,
  onSelectPhoto,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return true;
  });
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // References for render loop communication
  const isPlayingRef = useRef(true);
  const activeIndexRef = useRef(0);
  const orbitImagesRef = useRef<PortfolioImage[]>([]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    activeIndexRef.current = activePhotoIndex;
  }, [activePhotoIndex]);

  useEffect(() => {
    orbitImagesRef.current = orbitImages;
  }, [orbitImages]);

  // Fallback designed placeholders if no photos uploaded yet
  const effectivePhotos = useMemo(() => {
    if (orbitImages && orbitImages.length >= 2) {
      return orbitImages;
    }
    return [
      {
        id: 'placeholder-1',
        downloadUrl: centralImage?.downloadUrl || '',
        caption: 'AI Neural Matrix',
        captionHi: 'AI न्यूरल मैट्रिक्स',
        section: 'profile' as const,
        category: 'personal' as const,
        displayOrder: 1,
        isPublished: true,
        isMainProfile: true,
        storagePath: '',
        createdAt: null,
      },
      {
        id: 'placeholder-2',
        downloadUrl: '',
        caption: 'Python Core',
        captionHi: 'पायथन कोर',
        section: 'gallery' as const,
        category: 'coding' as const,
        displayOrder: 2,
        isPublished: true,
        isMainProfile: false,
        storagePath: '',
        createdAt: null,
      },
      {
        id: 'placeholder-3',
        downloadUrl: '',
        caption: 'Autonomous Agents',
        captionHi: 'स्वायत्त AI एजेंट्स',
        section: 'gallery' as const,
        category: 'ai_creation' as const,
        displayOrder: 3,
        isPublished: true,
        isMainProfile: false,
        storagePath: '',
        createdAt: null,
      },
      {
        id: 'placeholder-4',
        downloadUrl: '',
        caption: 'Machine Learning',
        captionHi: 'मशीन लर्निंग',
        section: 'gallery' as const,
        category: 'setup' as const,
        displayOrder: 4,
        isPublished: true,
        isMainProfile: false,
        storagePath: '',
        createdAt: null,
      },
    ];
  }, [orbitImages, centralImage]);

  // Carousel timer: every cycleInterval seconds, cycle active photo
  useEffect(() => {
    if (!isPlaying || effectivePhotos.length <= 1) return;
    const timer = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % effectivePhotos.length);
    }, cycleInterval * 1000);
    return () => clearInterval(timer);
  }, [isPlaying, cycleInterval, effectivePhotos.length]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8.5);

    // Renderer following Three.js guidelines
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (/HeadlessChrome/i.test(navigator.userAgent) || (navigator as any).webdriver);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Procedural Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x050c1e, 1.5);
    scene.add(ambientLight);

    const cyanKeyLight = new THREE.DirectionalLight(0x06b6d4, 3.8);
    cyanKeyLight.position.set(6, 4, 6);
    scene.add(cyanKeyLight);

    const violetFillLight = new THREE.DirectionalLight(0xa855f7, 2.5);
    violetFillLight.position.set(-6, -3, 4);
    scene.add(violetFillLight);

    const magentaRimLight = new THREE.PointLight(0xec4899, 4.2, 16);
    magentaRimLight.position.set(0, 5, -5);
    scene.add(magentaRimLight);

    // Master Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Procedural Texture Generator Helper for Circular Avatar Disc
    const createCircularPhotoTexture = (
      imgUrl?: string,
      label?: string,
      isPrimary = false
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Background Cyber Disc Gradient
      const grad = ctx.createRadialGradient(256, 256, 80, 256, 256, 256);
      grad.addColorStop(0, isPrimary ? '#081734' : '#0a0f1d');
      grad.addColorStop(0.85, isPrimary ? '#050c1e' : '#030712');
      grad.addColorStop(1, isPrimary ? '#06b6d4' : '#8b5cf6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Draw image if available
      if (imgUrl && imgUrl.trim() !== '') {
        const cleanUrl = imgUrl.trim();
        const imageObj = new Image();
        if (cleanUrl.startsWith('http')) {
          imageObj.crossOrigin = 'anonymous';
        }
        imageObj.src = cleanUrl;
        imageObj.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(256, 256, 235, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(imageObj, 21, 21, 470, 470);
          ctx.restore();

          // Border ring
          ctx.beginPath();
          ctx.arc(256, 256, 240, 0, Math.PI * 2);
          ctx.lineWidth = 14;
          ctx.strokeStyle = isPrimary ? '#06b6d4' : '#ec4899';
          ctx.stroke();
          tex.needsUpdate = true;
        };
        imageObj.onerror = (err) => {
          console.warn('[PhotoOrbitHero3D] Image failed to load, using placeholder:', imgUrl, err);
          ctx.fillStyle = isPrimary ? '#06b6d4' : '#a855f7';
          ctx.beginPath();
          ctx.arc(256, 200, 75, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(256, 390, 130, Math.PI, 0);
          ctx.fill();
          ctx.font = 'bold 24px Orbitron, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(label || 'MOHIT YADAV', 256, 470);
          tex.needsUpdate = true;
        };
      } else {
        // Futuristic Cyber Silhouette Placeholder
        ctx.fillStyle = isPrimary ? '#06b6d4' : '#a855f7';
        ctx.beginPath();
        ctx.arc(256, 200, 75, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(256, 390, 130, Math.PI, 0);
        ctx.fill();
        ctx.font = 'bold 24px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label || 'MOHIT YADAV', 256, 470);
      }

      ctx.beginPath();
      ctx.arc(256, 256, 246, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = isPrimary ? 'rgba(6, 182, 212, 0.8)' : 'rgba(236, 72, 153, 0.8)';
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // 2. Center Large Circular Portrait Disc
    const centerGeo = new THREE.CircleGeometry(1.65, 64);
    const centerTex = createCircularPhotoTexture(
      centralImage?.downloadUrl,
      'MOHIT YADAV',
      true
    );
    const centerMat = new THREE.MeshBasicMaterial({
      map: centerTex,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    rootGroup.add(centerMesh);

    // Center Outer Bezel Ring (PBR Metallic)
    const centerRingGeo = new THREE.TorusGeometry(1.72, 0.055, 16, 100);
    const centerRingMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
    });
    const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat);
    rootGroup.add(centerRing);

    // Center Outer Hexagonal / Dashed Holographic Halo
    const haloGeo = new THREE.RingGeometry(1.82, 1.95, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    rootGroup.add(haloMesh);

    // 3. Three Animated 3D Orbit Rings
    const orbit1Radius = 3.1;
    const orbit1Geo = new THREE.TorusGeometry(orbit1Radius, 0.035, 16, 140);
    const orbit1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.5,
    });
    const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
    orbit1.rotation.x = Math.PI / 6;
    rootGroup.add(orbit1);

    const orbit2Radius = 3.65;
    const orbit2Geo = new THREE.TorusGeometry(orbit2Radius, 0.03, 16, 140);
    const orbit2Mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.45,
    });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.rotation.x = -Math.PI / 5;
    orbit2.rotation.y = Math.PI / 8;
    rootGroup.add(orbit2);

    const orbit3Radius = 4.2;
    const orbit3Geo = new THREE.TorusGeometry(orbit3Radius, 0.025, 16, 140);
    const orbit3Mat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0xdb2777,
      emissiveIntensity: 0.35,
    });
    const orbit3 = new THREE.Mesh(orbit3Geo, orbit3Mat);
    orbit3.rotation.z = Math.PI / 4;
    rootGroup.add(orbit3);

    // 4. Orbiting Photo Nodes
    const nodeCount = Math.min(Math.max(effectivePhotos.length, 3), 5);
    const nodeGroup = new THREE.Group();
    rootGroup.add(nodeGroup);

    const photoNodes: THREE.Mesh[] = [];
    const photoRings: THREE.Mesh[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const item = effectivePhotos[i % effectivePhotos.length];
      const nodeGeo = new THREE.CircleGeometry(0.55, 32);
      const nodeTex = createCircularPhotoTexture(
        item.downloadUrl,
        item.caption || `PHOTO ${i + 1}`,
        false
      );
      const nodeMat = new THREE.MeshBasicMaterial({
        map: nodeTex,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);

      const nodeRingGeo = new THREE.TorusGeometry(0.58, 0.03, 16, 48);
      const nodeRingMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0xec4899,
        metalness: 0.95,
        roughness: 0.15,
        emissive: i % 2 === 0 ? 0x0891b2 : 0xdb2777,
        emissiveIntensity: 0.5,
      });
      const ringMesh = new THREE.Mesh(nodeRingGeo, nodeRingMat);
      nodeMesh.add(ringMesh);

      const angle = (i / nodeCount) * Math.PI * 2;
      nodeMesh.position.x = Math.cos(angle) * orbit1Radius;
      nodeMesh.position.y = Math.sin(angle) * orbit1Radius;
      nodeMesh.position.z = 0;
      nodeMesh.userData = { index: i, angle, item };

      nodeGroup.add(nodeMesh);
      photoNodes.push(nodeMesh);
      photoRings.push(ringMesh);
    }

    // 5. Procedural Star & Cyber Quantum Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const cyan = new THREE.Color(0x06b6d4);
    const violet = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.0 + Math.random() * 3.5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
      const mixed = cyan.clone().lerp(violet, Math.random());
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // Mouse & Touch Drag Controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let autoAngle = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevX = cx;
      prevY = cy;
      sound.playClick();
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if (isDragging) {
        const dx = cx - prevX;
        const dy = cy - prevY;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        prevX = cx;
        prevY = cy;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const playing = isPlayingRef.current;

      if (playing && !isDragging) {
        autoAngle += 0.45 * delta;
      }

      rootGroup.rotation.y = THREE.MathUtils.damp(
        rootGroup.rotation.y,
        targetRotY + (isDragging ? 0 : autoAngle * 0.3),
        3.5,
        delta
      );
      rootGroup.rotation.x = THREE.MathUtils.damp(
        rootGroup.rotation.x,
        targetRotX + Math.sin(elapsed * 0.6) * 0.06,
        3.5,
        delta
      );

      orbit1.rotation.z += 0.35 * delta;
      orbit2.rotation.y += 0.25 * delta;
      orbit3.rotation.x -= 0.2 * delta;
      haloMesh.rotation.z -= 0.4 * delta;

      for (let i = 0; i < photoNodes.length; i++) {
        const node = photoNodes[i];
        const baseAngle = node.userData.angle + (playing ? autoAngle : 0);
        node.position.x = Math.cos(baseAngle) * orbit1Radius;
        node.position.y = Math.sin(baseAngle) * orbit1Radius * Math.cos(orbit1.rotation.x);
        node.position.z = Math.sin(baseAngle) * orbit1Radius * Math.sin(orbit1.rotation.x);
        node.lookAt(camera.position);

        const isActive = i === activeIndexRef.current;
        const targetScale = isActive ? 1.35 : 1.0;
        node.scale.setScalar(THREE.MathUtils.damp(node.scale.x, targetScale, 4.0, delta));
      }

      const centerPulse = 1 + Math.sin(elapsed * 2) * 0.025;
      centerMesh.scale.set(centerPulse, centerPulse, centerPulse);
      centerRing.scale.set(centerPulse, centerPulse, centerPulse);
      centerMesh.lookAt(camera.position);

      particles.rotation.y += 0.12 * delta;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
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
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      centerGeo.dispose();
      centerTex.dispose();
      centerMat.dispose();
      centerRingGeo.dispose();
      centerRingMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      orbit1Geo.dispose();
      orbit1Mat.dispose();
      orbit2Geo.dispose();
      orbit2Mat.dispose();
      orbit3Geo.dispose();
      orbit3Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [centralImage, effectivePhotos]);

  const activePhoto = effectivePhotos[activePhotoIndex] || effectivePhotos[0];

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[530px] flex items-center justify-center overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-gray-950/80 via-gray-900/40 to-gray-950/90 backdrop-blur-xl shadow-2xl">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Drag or touch to spin the 3D Photo-Orbit"
      />
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-gray-950/85 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        <span>3D PHOTO-ORBIT NEXUS</span>
        <span className="hidden sm:inline text-gray-500">|</span>
        <span className="hidden sm:inline text-xs text-pink-300">
          FEATURED: #{activePhotoIndex + 1}
        </span>
      </div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => {
            sound.playClick();
            setIsPlaying(!isPlaying);
          }}
          className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-cyan-300 border border-gray-700/80 hover:border-cyan-500/50 transition backdrop-blur-md"
          title={isPlaying ? 'Pause Auto-Orbit' : 'Resume Auto-Orbit'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[440px] bg-gray-950/90 border border-cyan-500/40 rounded-2xl p-3 sm:p-3.5 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/60 shrink-0 bg-black flex items-center justify-center">
            {activePhoto?.downloadUrl && activePhoto.downloadUrl.trim() !== '' ? (
              <img
                src={activePhoto.downloadUrl || undefined}
                alt={activePhoto.caption || 'Active Photo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-cyan-400 uppercase block tracking-wider">
              {activePhoto?.section ? `Section // ${activePhoto.section}` : 'Featured Portrait'}
            </span>
            <h4 className="font-cyber font-bold text-xs sm:text-sm text-white truncate">
              {activePhoto?.caption || 'Mohit Yadav - Official Portfolio'}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {effectivePhotos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setActivePhotoIndex(idx);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === activePhotoIndex
                  ? 'bg-cyan-400 w-5 shadow-sm shadow-cyan-400/50'
                  : 'bg-gray-700 hover:bg-gray-500'
              }`}
              title={`Switch to photo #${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
