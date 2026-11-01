import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import * as THREE from 'three';
import { DivineLightSweep } from '../royal/DivineLightSweep';
import {
  subscribeRoyalIdentity,
  DEFAULT_ROYAL_CONFIG,
} from '../../services/royalIdentityService';
import {
  RoyalIdentityConfig,
  RoyalIdentityImage,
} from '../../types';
import { sound } from '../audio/SoundEffects';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DivineHero3DProps {
  isPaused?: boolean;
  onExplorePortfolio?: () => void;
  onContactClick?: () => void;
}

const SERIF: React.CSSProperties = {
  fontFamily: '"Cormorant Garamond", Georgia, serif',
};

const GOLD_TEXT: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(120deg, #FFF8E8 0%, #D4AF5F 48%, #A8823A 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

export const DivineHero3D: React.FC<DivineHero3DProps> = ({
  isPaused: externalPaused = false,
  onExplorePortfolio,
  onContactClick,
}) => {
  const { mode } = useLanguage();
  const { mainProfileImage, siteSettings } = useImages();

  const hi = mode === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);

  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [config, setConfig] =
    useState<RoyalIdentityConfig>(DEFAULT_ROYAL_CONFIG);
  const [activePoseIdx, setActivePoseIdx] = useState(0);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const pendingPoseIdxRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const isSweepingRef = useRef(false);
  const externalPausedRef = useRef(externalPaused);
  const requestedTextureUrlRef = useRef<string | null>(null);
  const textureRequestIdRef = useRef(0);
  const transitionUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const photoMeshRef = useRef<THREE.Mesh | null>(null);
  const photoMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sweepPointLightRef = useRef<THREE.PointLight | null>(null);
  const pedestalGroupRef = useRef<THREE.Group | null>(null);
  const stageParticlesRef = useRef<THREE.Points | null>(null);
  const haloGroupRef = useRef<THREE.Group | null>(null);

  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());
  const photoAspectRef = useRef(0.72);

  const enabledImages: RoyalIdentityImage[] = useMemo(
    () => (config.images || []).filter((img) => img.isEnabled && !!img.url),
    [config.images]
  );

  const fallbackUrl = useMemo(() => {
    if (mainProfileImage?.downloadUrl) {
      return mainProfileImage.downloadUrl;
    }

    try {
      const local = localStorage.getItem('mohit_profile_photo');
      if (local) return local;
    } catch {
      // Local storage may be unavailable in private browsing.
    }

    return '/images/WhatsApp_Image_2026-03-02_at_15.00.34_9b3e100e-removebg-preview.png';
  }, [mainProfileImage]);

  const safeActivePoseIdx =
    enabledImages.length > 0
      ? Math.min(activePoseIdx, enabledImages.length - 1)
      : 0;

  const currentImageUrl = useMemo(() => {
    if (enabledImages.length > 0) {
      return enabledImages[safeActivePoseIdx]?.url || fallbackUrl;
    }
    return fallbackUrl;
  }, [enabledImages, safeActivePoseIdx, fallbackUrl]);

  useEffect(() => {
    externalPausedRef.current = externalPaused;
  }, [externalPaused]);

  useEffect(() => {
    isSweepingRef.current = isSweeping;
  }, [isSweeping]);

  // Keep the active index valid when Admin changes the enabled image list.
  useEffect(() => {
    if (enabledImages.length === 0) {
      setActivePoseIdx(0);
      return;
    }

    setActivePoseIdx((current) =>
      Math.min(current, enabledImages.length - 1)
    );
  }, [enabledImages.length]);

  // Subscribe to the existing Firebase / local royal identity service.
  useEffect(() => {
    const unsubscribe = subscribeRoyalIdentity((newConfig) => {
      setConfig(newConfig);

      const enabled = (newConfig.images || []).filter(
        (item) => item.isEnabled && !!item.url
      );

      if (newConfig.activeImageId && enabled.length > 0) {
        const found = enabled.findIndex(
          (item) => item.id === newConfig.activeImageId
        );

        if (found >= 0) {
          setActivePoseIdx(found);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Preload enabled Cloudinary / Firebase image URLs.
  useEffect(() => {
    if (enabledImages.length === 0) return;

    const loader = new THREE.TextureLoader();

    enabledImages.forEach((item) => {
      const browserImage = new Image();
      browserImage.src = item.url;

      if (textureCache.current.has(item.url)) return;

      loader.load(
        item.url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          textureCache.current.set(item.url, texture);
        },
        undefined,
        (error) => {
          console.warn(
            '[DivinePhotoStage3D] Image preload warning:',
            item.url,
            error
          );
        }
      );
    });
  }, [enabledImages]);

  // Fit the transparent PNG inside the visible camera area without stretching.
  const updatePhotoGeometry = useCallback(() => {
    const mesh = photoMeshRef.current;
    const camera = cameraRef.current;

    if (!mesh || !camera) return;

    const visibleHeight =
      2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

    const visibleWidth = visibleHeight * camera.aspect;
    const aspect = Math.max(0.1, photoAspectRef.current);

    const maxHeight = Math.min(3.85, visibleHeight * 0.88);
    const maxWidth = Math.min(3.25, visibleWidth * 0.82);

    let height = maxHeight;
    let width = height * aspect;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspect;
    }

    const oldGeometry = mesh.geometry;
    mesh.geometry = new THREE.PlaneGeometry(width, height);
    oldGeometry.dispose();
  }, []);

  // Apply a texture safely. Older asynchronous loads cannot replace a newer photo.
  const applyTextureToMesh = useCallback(
    (url: string | null) => {
      const requestId = ++textureRequestIdRef.current;
      requestedTextureUrlRef.current = url;

      const mesh = photoMeshRef.current;
      const material = photoMaterialRef.current;

      if (!mesh || !material) return;

      if (!url) {
        mesh.visible = false;
        return;
      }

      const setTexture = (texture: THREE.Texture) => {
        if (
          requestId !== textureRequestIdRef.current ||
          requestedTextureUrlRef.current !== url ||
          !photoMeshRef.current ||
          !photoMaterialRef.current
        ) {
          return;
        }

        const image = texture.image as
          | { width?: number; height?: number }
          | undefined;

        if (
          image?.width &&
          image?.height &&
          image.height > 0
        ) {
          photoAspectRef.current = image.width / image.height;
        }

        photoMaterialRef.current.map = texture;
        photoMaterialRef.current.needsUpdate = true;
        photoMeshRef.current.visible = true;

        updatePhotoGeometry();
      };

      const cachedTexture = textureCache.current.get(url);

      if (cachedTexture) {
        setTexture(cachedTexture);
        return;
      }

      const loader = new THREE.TextureLoader();

      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;

          textureCache.current.set(url, texture);
          setTexture(texture);
        },
        undefined,
        (error) => {
          console.warn('[DivinePhotoStage3D] Texture load warning:', error);
        }
      );
    },
    [updatePhotoGeometry]
  );

  const triggerTransition = useCallback(
    (targetIndex: number) => {
      if (
        isTransitioningRef.current ||
        enabledImages.length <= 1 ||
        targetIndex < 0 ||
        targetIndex >= enabledImages.length
      ) {
        return;
      }

      isTransitioningRef.current = true;
      pendingPoseIdxRef.current = targetIndex;

      sound.playWarp();
      setIsSweeping(true);
    },
    [enabledImages.length]
  );

  const nextPose = useCallback(() => {
    if (enabledImages.length <= 1) return;

    const nextIndex = (safeActivePoseIdx + 1) % enabledImages.length;
    triggerTransition(nextIndex);
  }, [safeActivePoseIdx, enabledImages.length, triggerTransition]);

  const prevPose = useCallback(() => {
    if (enabledImages.length <= 1) return;

    const previousIndex =
      (safeActivePoseIdx - 1 + enabledImages.length) % enabledImages.length;

    triggerTransition(previousIndex);
  }, [safeActivePoseIdx, enabledImages.length, triggerTransition]);

  // Swap the photo precisely when the light reaches its brightest point.
  const handleSweepMidpoint = useCallback(() => {
    const pendingIndex = pendingPoseIdxRef.current;

    if (pendingIndex === null) return;

    const safeIndex = Math.min(
      pendingIndex,
      Math.max(0, enabledImages.length - 1)
    );

    setActivePoseIdx(safeIndex);

    const targetUrl = enabledImages[safeIndex]?.url || fallbackUrl;
    applyTextureToMesh(targetUrl);

    pendingPoseIdxRef.current = null;
  }, [enabledImages, fallbackUrl, applyTextureToMesh]);

  const handleSweepComplete = useCallback(() => {
    setIsSweeping(false);
    isSweepingRef.current = false;

    if (transitionUnlockTimerRef.current) {
      clearTimeout(transitionUnlockTimerRef.current);
    }

    transitionUnlockTimerRef.current = setTimeout(() => {
      isTransitioningRef.current = false;
      transitionUnlockTimerRef.current = null;
    }, 100);
  }, []);

  // About 2 seconds of photo display, followed by the 700ms light transition.
  // This loop is independent of page scrolling.
  useEffect(() => {
    if (
      enabledImages.length <= 1 ||
      externalPaused ||
      isUserPaused ||
      isHovered
    ) {
      return;
    }

    const interval = setInterval(() => {
      if (!isTransitioningRef.current) {
        nextPose();
      }
    }, 2700);

    return () => clearInterval(interval);
  }, [
    enabledImages.length,
    externalPaused,
    isUserPaused,
    isHovered,
    nextPose,
  ]);

  // Update the photo only. The Three.js scene itself remains mounted.
  useEffect(() => {
    applyTextureToMesh(currentImageUrl);
  }, [currentImageUrl, applyTextureToMesh]);

  // Main Three.js stage: initialize once, not on every photo transition.
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      console.warn('[DivinePhotoStage3D] WebGL initialization failed:', error);
      return;
    }

    const width = Math.max(1, mount.clientWidth || 480);
    const height = Math.max(1, mount.clientHeight || 580);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050506);
    scene.fog = new THREE.FogExp2(0x080808, 0.035);
    sceneRef.current = scene;

    // Fixed camera: no scroll listener, no scroll zoom and no scroll movement.
    const camera = new THREE.PerspectiveCamera(
      40,
      width / height,
      0.1,
      60
    );
    camera.position.set(0, 0.05, 5.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Luxury lighting rig ──────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x77706a, 1.15));

    const pearlKey = new THREE.DirectionalLight(0xfff8ed, 2.8);
    pearlKey.position.set(3.5, 5, 4);
    scene.add(pearlKey);

    const goldRim = new THREE.DirectionalLight(0xd4af5f, 2.5);
    goldRim.position.set(-4, 1.5, -2.5);
    scene.add(goldRim);

    const silverRim = new THREE.DirectionalLight(0xc7d0dc, 1.65);
    silverRim.position.set(4, 1, -3);
    scene.add(silverRim);

    const lowerGoldLight = new THREE.SpotLight(
      0xd4af5f,
      2.1,
      10,
      Math.PI / 4,
      0.65
    );
    lowerGoldLight.position.set(0, -3, 2);
    lowerGoldLight.target.position.set(0, 0, 0);
    scene.add(lowerGoldLight, lowerGoldLight.target);

    const sweepLight = new THREE.PointLight(0xfff3d6, 0, 12);
    sweepLight.position.set(0, 3.8, 2.5);
    scene.add(sweepLight);
    sweepPointLightRef.current = sweepLight;

    // ── Deep 3D halo environment behind the portrait ────────────
    const haloGroup = new THREE.Group();
    haloGroup.position.set(0, 0.05, -1.15);
    scene.add(haloGroup);
    haloGroupRef.current = haloGroup;

    const goldHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9a24e,
      transparent: true,
      opacity: 0.56,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const brightGoldMaterial = new THREE.MeshBasicMaterial({
      color: 0xf2d99b,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const silverHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0xc7d0dc,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const haloOuter = new THREE.Mesh(
      new THREE.TorusGeometry(1.72, 0.018, 12, 128),
      goldHaloMaterial
    );
    haloOuter.scale.set(1, 1.22, 1);
    haloGroup.add(haloOuter);

    const haloInner = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.009, 10, 128),
      silverHaloMaterial
    );
    haloInner.scale.set(1, 1.2, 1);
    haloInner.rotation.z = Math.PI / 5;
    haloGroup.add(haloInner);

    const haloAccent = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.008, 8, 128),
      brightGoldMaterial
    );
    haloAccent.scale.set(1, 1.16, 1);
    haloAccent.rotation.z = -Math.PI / 7;
    haloGroup.add(haloAccent);

    // Floating metallic arc details.
    const arcOne = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.012, 8, 100, Math.PI * 1.15),
      silverHaloMaterial
    );
    arcOne.position.z = -0.08;
    arcOne.rotation.set(0.2, 0.15, -0.7);
    haloGroup.add(arcOne);

    const arcTwo = new THREE.Mesh(
      new THREE.TorusGeometry(2.12, 0.014, 8, 100, Math.PI * 0.8),
      goldHaloMaterial
    );
    arcTwo.position.z = 0.02;
    arcTwo.rotation.set(-0.15, 0.25, 2.1);
    haloGroup.add(arcTwo);

    // Soft ambient glow discs behind the portrait.
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;

    const glowContext = glowCanvas.getContext('2d');
    if (glowContext) {
      const gradient = glowContext.createRadialGradient(
        64, 64, 2, 64, 64, 64
      );
      gradient.addColorStop(0, 'rgba(255,238,195,0.32)');
      gradient.addColorStop(0.35, 'rgba(212,175,95,0.16)');
      gradient.addColorStop(1, 'rgba(212,175,95,0)');
      glowContext.fillStyle = gradient;
      glowContext.fillRect(0, 0, 128, 128);
    }

    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    });

    const ambientGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 5.2),
      glowMaterial
    );
    ambientGlow.position.set(0, 0, -0.35);
    haloGroup.add(ambientGlow);

    // ── Main transparent portrait plane ─────────────────────────
    const photoMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      alphaTest: 0.008,
      roughness: 0.42,
      metalness: 0.02,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    photoMaterialRef.current = photoMaterial;

    const photoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 3.5),
      photoMaterial
    );
    photoMesh.position.set(0, 0.02, 0.2);
    photoMesh.renderOrder = 2;
    scene.add(photoMesh);
    photoMeshRef.current = photoMesh;

    // ── Floating gold + silver particles ────────────────────────
    const particleCount = 145;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5.2;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
      particlePositions[i * 3 + 2] = -1.5 + Math.random() * 2.3;
      particleSizes[i] = 0.5 + Math.random() * 1.2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(particleSizes, 1)
    );

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;

    const particleContext = particleCanvas.getContext('2d');
    if (particleContext) {
      const gradient = particleContext.createRadialGradient(
        16, 16, 0, 16, 16, 16
      );
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.22, 'rgba(246,235,204,0.95)');
      gradient.addColorStop(0.55, 'rgba(212,175,95,0.55)');
      gradient.addColorStop(1, 'rgba(212,175,95,0)');
      particleContext.fillStyle = gradient;
      particleContext.fillRect(0, 0, 32, 32);
    }

    const particleTexture = new THREE.CanvasTexture(particleCanvas);
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf4dfb0,
      size: 0.075,
      map: particleTexture,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(
      particleGeometry,
      particleMaterial
    );
    particles.renderOrder = 3;
    scene.add(particles);
    stageParticlesRef.current = particles;

    // ── Metallic pedestal below the portrait ────────────────────
    const pedestal = new THREE.Group();
    pedestal.position.y = -2.05;
    scene.add(pedestal);
    pedestalGroupRef.current = pedestal;

    const pedestalGold = new THREE.MeshStandardMaterial({
      color: 0xb89145,
      metalness: 0.92,
      roughness: 0.22,
      emissive: 0x38270a,
      emissiveIntensity: 0.55,
    });

    const pedestalSilver = new THREE.MeshStandardMaterial({
      color: 0xb8c0ca,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x20252b,
      emissiveIntensity: 0.35,
    });

    const platformDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.32, 0.12, 80),
      new THREE.MeshStandardMaterial({
        color: 0x101114,
        metalness: 0.82,
        roughness: 0.28,
      })
    );
    pedestal.add(platformDisc);

    const platformGoldRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.18, 0.035, 12, 80),
      pedestalGold
    );
    platformGoldRing.rotation.x = Math.PI / 2;
    platformGoldRing.position.y = 0.07;
    pedestal.add(platformGoldRing);

    const platformSilverRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.02, 0.012, 8, 80),
      pedestalSilver
    );
    platformSilverRing.rotation.x = Math.PI / 2;
    platformSilverRing.position.y = 0.085;
    pedestal.add(platformSilverRing);

    // ── Mouse movement only inside the stage module ─────────────
    const handleStageMouseMove = (event: MouseEvent) => {
      const stage = stageContainerRef.current;
      if (!stage) return;

      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;

      if (
        relativeX >= 0 &&
        relativeX <= 1 &&
        relativeY >= 0 &&
        relativeY <= 1
      ) {
        mouseRef.current.targetX = (relativeX - 0.5) * 2;
        mouseRef.current.targetY = -(relativeY - 0.5) * 2;
      }
    };

    window.addEventListener('mousemove', handleStageMouseMove, {
      passive: true,
    });

    // ── Responsive stage sizing ─────────────────────────────────
    const handleResize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updatePhotoGeometry();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // ── Independent animation loop; never reads page scroll ─────
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (externalPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.04);
      const elapsed = clock.elapsedTime;

      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

      // Gentle portrait movement. No camera zoom or scroll response.
      if (photoMeshRef.current) {
        photoMeshRef.current.position.y =
          0.02 + Math.sin(elapsed * 1.25) * 0.025;

        photoMeshRef.current.rotation.y =
          mouseRef.current.x * 0.075 +
          Math.sin(elapsed * 0.45) * 0.008;

        photoMeshRef.current.rotation.x = -mouseRef.current.y * 0.035;
      }

      if (haloGroupRef.current) {
        haloGroupRef.current.rotation.z =
          Math.sin(elapsed * 0.16) * 0.035;
        haloGroupRef.current.rotation.y =
          Math.sin(elapsed * 0.12) * 0.045;
      }

      if (pedestalGroupRef.current) {
        pedestalGroupRef.current.rotation.y += delta * 0.12;
      }

      if (stageParticlesRef.current) {
        stageParticlesRef.current.rotation.y += delta * 0.018;
        stageParticlesRef.current.rotation.x =
          Math.sin(elapsed * 0.2) * 0.025;
      }

      if (sweepPointLightRef.current) {
        if (isSweepingRef.current) {
          sweepPointLightRef.current.intensity = THREE.MathUtils.lerp(
            sweepPointLightRef.current.intensity,
            8,
            0.14
          );

          sweepPointLightRef.current.position.y =
            Math.sin(elapsed * 5) * 1.2;
        } else {
          sweepPointLightRef.current.intensity = THREE.MathUtils.lerp(
            sweepPointLightRef.current.intensity,
            0,
            0.1
          );
          sweepPointLightRef.current.position.y = 3.8;
        }
      }

      renderer.render(scene, camera);
    };

    updatePhotoGeometry();
    applyTextureToMesh(currentImageUrl);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleStageMouseMove);
      resizeObserver.disconnect();

      if (transitionUnlockTimerRef.current) {
        clearTimeout(transitionUnlockTimerRef.current);
        transitionUnlockTimerRef.current = null;
      }

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      renderer.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry?.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });

      textureCache.current.forEach((texture) => texture.dispose());
      textureCache.current.clear();

      glowTexture.dispose();
      particleTexture.dispose();

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      photoMeshRef.current = null;
      photoMaterialRef.current = null;
      sweepPointLightRef.current = null;
      pedestalGroupRef.current = null;
      stageParticlesRef.current = null;
      haloGroupRef.current = null;
    };
    // Deliberately initialize the WebGL scene once.
    // Image changes are handled by the separate texture effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title =
    siteSettings.hero?.heroTitle ||
    siteSettings.heroTitle ||
    'Mohit Yadav';

  const subtitle = hi
    ? 'भावी AI इंजीनियर · पायथन डेवलपर · वेब व ऐप निर्माता'
    : siteSettings.hero?.heroSubtitle ||
      siteSettings.heroSubtitle ||
      'Future AI Engineer · Python Developer · Web & App Creator';

  const bio = t(
    'Class 12 Science student turning curiosity into real AI, Python, and web products. Driven by innovation, modern architecture, and clean craftsmanship.',
    'कक्षा 12 विज्ञान का छात्र, जो जिज्ञासा को असली AI, पायथन और वेब प्रोजेक्ट में बदल रहा है।'
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#050506] text-[#F6F0E4] select-none">
      {/* Full-page ambient atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[22%] h-[520px] w-[700px] -translate-x-1/2 rounded-full bg-[#D4AF5F]/[0.045] blur-[150px]" />
        <div className="absolute bottom-0 left-[10%] h-[360px] w-[440px] rounded-full bg-[#C7D0DC]/[0.025] blur-[130px]" />
        <div className="absolute right-[-12%] top-[35%] h-[350px] w-[350px] rounded-full bg-[#D4AF5F]/[0.025] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Header */}
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4AF5F]/30 bg-[#0E0C09]/80 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#D4AF5F] shadow-[0_0_10px_#D4AF5F] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF5F]">
              {hi ? 'डिवाइन 3D स्टेज अनुभव' : 'Divine 3D Presentation Stage'}
            </span>
          </div>

          {enabledImages.length > 1 && (
            <div className="flex items-center gap-2 rounded-full border border-[#D4AF5F]/25 bg-[#0E0C09]/80 px-3 py-1.5 backdrop-blur-md">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-[#A9A39A]">
                {t('Pose', 'पोज़')} {safeActivePoseIdx + 1}/{enabledImages.length}
              </span>

              <div className="flex items-center gap-1.5">
                {enabledImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => triggerTransition(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      safeActivePoseIdx === index
                        ? 'w-5 bg-[#D4AF5F]'
                        : 'w-1.5 bg-[#A9A39A]/40 hover:bg-[#D4AF5F]/70'
                    }`}
                    aria-label={`Switch to pose ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsUserPaused((paused) => !paused)}
                className="ml-1 p-1 text-[#A9A39A] transition-colors hover:text-[#D4AF5F]"
                title={isUserPaused ? 'Resume auto-transition' : 'Pause auto-transition'}
                aria-label={isUserPaused ? 'Resume slideshow' : 'Pause slideshow'}
              >
                {isUserPaused ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Hero content */}
        <div className="my-auto grid grid-cols-1 items-center gap-8 py-6 sm:py-8 lg:grid-cols-12 lg:gap-12">
          {/* Typography and actions */}
          <div className="order-2 space-y-5 text-center lg:col-span-6 lg:order-1 lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF5F]">
              {subtitle}
            </p>

            <h1
              className="text-4xl font-light leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ ...SERIF, ...GOLD_TEXT }}
            >
              {title}
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#C8BFB0]/90 sm:text-base lg:mx-0">
              {bio}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 lg:justify-start">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();

                  if (onExplorePortfolio) {
                    onExplorePortfolio();
                  } else {
                    document
                      .getElementById('about')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14100A] shadow-[0_8px_25px_rgba(212,175,95,0.25)] transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(120deg, #F6EBCC, #D4AF5F)',
                }}
              >
                {t('Explore Portfolio', 'पोर्टफोलियो देखें')}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();

                  if (onContactClick) {
                    onContactClick();
                  } else {
                    document
                      .getElementById('contact')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex cursor-pointer items-center rounded-full border border-[#C7D0DC]/30 bg-[#0E0C09]/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F6F0E4] backdrop-blur-sm transition-colors hover:border-[#D4AF5F]/70 hover:text-[#F6EBCC] active:scale-95"
              >
                {t('Contact Me', 'संपर्क करें')}
              </button>

              {enabledImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    nextPose();
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D4AF5F]/25 bg-[#0E0C09]/40 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF5F] backdrop-blur-sm transition-colors hover:bg-[#D4AF5F]/10"
                  title="Trigger Divine Light Sweep to next pose"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF5F]" />
                  <span>{t('Next Pose', 'अगला पोज़')}</span>
                </button>
              )}
            </div>

            {/* Quick information */}
            <div className="grid grid-cols-2 gap-3 border-t border-[#D4AF5F]/20 pt-6 text-left sm:grid-cols-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#9A8F7C]">
                  {t('Status', 'स्थिति')}
                </p>
                <p className="mt-1 text-base font-normal text-[#F6F0E4] sm:text-lg" style={SERIF}>
                  {t('Class 12 Sci', 'कक्षा 12')}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#9A8F7C]">
                  {t('Focus', 'फ़ोकस')}
                </p>
                <p className="mt-1 text-base font-normal text-[#F6F0E4] sm:text-lg" style={SERIF}>
                  Python & AI
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#9A8F7C]">
                  {t('Builds', 'प्रोजेक्ट्स')}
                </p>
                <p className="mt-1 text-base font-normal text-[#F6F0E4] sm:text-lg" style={SERIF}>
                  6 Live Apps
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#9A8F7C]">
                  {t('Experience', 'अनुभव')}
                </p>
                <p className="mt-1 text-base font-normal text-[#D4AF5F] sm:text-lg" style={SERIF}>
                  Divine 3D
                </p>
              </div>
            </div>
          </div>

          {/* Separate luxury 3D stage module */}
          <div className="order-1 flex items-center justify-center lg:col-span-6 lg:order-2">
            <div
              ref={stageContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                mouseRef.current.targetX = 0;
                mouseRef.current.targetY = 0;
              }}
              className="relative h-[500px] w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#D4AF5F]/30 bg-[#08090B] shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_45px_rgba(212,175,95,0.12)] sm:h-[560px] sm:max-w-[460px] lg:h-[620px] lg:max-w-[500px]"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 42%, rgba(212,175,95,0.09), transparent 52%), linear-gradient(145deg, #14120F 0%, #08090B 48%, #050506 100%)',
              }}
            >
              {/* Fine metallic inner frame */}
              <div className="pointer-events-none absolute inset-[7px] z-[5] rounded-[22px] border border-[#C7D0DC]/10" />
              <div className="pointer-events-none absolute inset-x-10 top-0 z-[5] h-px bg-gradient-to-r from-transparent via-[#F6EBCC]/70 to-transparent" />

              {/* Three.js canvas */}
              <div
                ref={canvasMountRef}
                className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
              />

              {/* Light sweep is restricted to this module */}
              <DivineLightSweep
                isSweeping={isSweeping}
                durationMs={700}
                onMidpoint={handleSweepMidpoint}
                onComplete={handleSweepComplete}
              />

              {/* Stage header */}
              <div className="pointer-events-none absolute inset-x-4 top-4 z-40 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF5F]/25 bg-[#08090B]/75 px-3 py-1 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF5F] shadow-[0_0_8px_#D4AF5F] animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#E8D4A5]">
                    LUXURY 3D STAGE
                  </span>
                </div>

                {enabledImages.length > 1 && (
                  <div className="pointer-events-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevPose}
                      className="rounded-full border border-[#C7D0DC]/20 bg-[#08090B]/75 p-1.5 text-[#C7D0DC] backdrop-blur-md transition-colors hover:border-[#D4AF5F]/60 hover:text-[#D4AF5F]"
                      aria-label="Previous Pose"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={nextPose}
                      className="rounded-full border border-[#C7D0DC]/20 bg-[#08090B]/75 p-1.5 text-[#C7D0DC] backdrop-blur-md transition-colors hover:border-[#D4AF5F]/60 hover:text-[#D4AF5F]"
                      aria-label="Next Pose"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom stage labels */}
              <div className="pointer-events-none absolute inset-x-4 bottom-4 z-40 flex items-center justify-between gap-2 font-mono text-[9px] text-[#B7B0A4]">
                <span className="max-w-[60%] truncate rounded-md border border-[#C7D0DC]/15 bg-[#08090B]/75 px-2.5 py-1 backdrop-blur-md">
                  {enabledImages[safeActivePoseIdx]?.title ||
                    'Mohit Yadav — Studio Pose'}
                </span>

                <span className="rounded-md border border-[#D4AF5F]/20 bg-[#08090B]/75 px-2.5 py-1 text-[#D4AF5F] backdrop-blur-md">
                  2s DISPLAY · 0.7s SWEEP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll navigation only; it does not control the 3D scene */}
        <div className="flex w-full justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              document
                .getElementById('about')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex cursor-pointer flex-col items-center gap-1 text-[#9A8F7C] transition-colors hover:text-[#D4AF5F]"
          >
            <span className="text-[9px] uppercase tracking-[0.25em]">
              {t('Scroll to explore', 'नीचे स्क्रॉल करें')}
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};