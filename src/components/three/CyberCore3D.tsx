import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sound } from '../audio/SoundEffects';
import { Eye, RotateCcw, Sliders, ChevronDown, ChevronUp, Zap, Sparkles } from 'lucide-react';

interface CyberCore3DProps {
  onInteraction?: () => void;
}

export const CyberCore3D: React.FC<CyberCore3DProps> = ({ onInteraction }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Bottom dock interactive controls state
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [explosionFactor, setExplosionFactor] = useState(0.2);
  const [coreMode, setCoreMode] = useState<'quantum' | 'overdrive' | 'stealth'>('quantum');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // References to communicate with Three.js loop without re-instantiation
  const explosionRef = useRef(0.2);
  const speedRef = useRef(1);
  const modeRef = useRef<'quantum' | 'overdrive' | 'stealth'>('quantum');

  useEffect(() => {
    explosionRef.current = explosionFactor;
  }, [explosionFactor]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    modeRef.current = coreMode;
  }, [coreMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const isHeadless = typeof navigator !== 'undefined' && (/HeadlessChrome/i.test(navigator.userAgent) || (navigator as any).webdriver);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0a1024, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x06b6d4, 3.5);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 2.8);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xec4899, 4.0, 15);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Master Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Inner Energy Core (Icosahedron with metallic PBR surface)
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Core Wireframe halo
    const wireCoreGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const wireCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const wireCoreMesh = new THREE.Mesh(wireCoreGeo, wireCoreMat);
    rootGroup.add(wireCoreMesh);

    // 2. Gyroscopic Orbital Rings
    // Ring 1 (Cyan Axis)
    const ring1Geo = new THREE.TorusGeometry(1.65, 0.045, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    rootGroup.add(ring1);

    // Ring 2 (Purple/Violet Axis)
    const ring2Geo = new THREE.TorusGeometry(2.1, 0.045, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.4,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    rootGroup.add(ring2);

    // Ring 3 (Magenta Outer Guard)
    const ring3Geo = new THREE.TorusGeometry(2.55, 0.035, 16, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xdb2777,
      emissiveIntensity: 0.3,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    rootGroup.add(ring3);

    // 3. Holographic Geodesic Outer Cage
    const cageGeo = new THREE.IcosahedronGeometry(3.05, 1);
    const cageMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.5,
    });
    const outerCage = new THREE.Mesh(cageGeo, cageMat);
    rootGroup.add(outerCage);

    // 4. Procedural Quantum Particle Swarm
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const cyanColor = new THREE.Color(0x06b6d4);
    const magentaColor = new THREE.Color(0xec4899);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.3 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = cyanColor.clone().lerp(magentaColor, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // Soft Radial Ground Contact Shadow plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      grad.addColorStop(0.3, 'rgba(6, 182, 212, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;

    const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.6;
    scene.add(shadowPlane);

    // Mouse / Pointer Interaction tracking
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
      sound.playClick();
      if (onInteraction) onInteraction();
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        prevMouseX = clientX;
        prevMouseY = clientY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Zero-GC Preallocated Math Helpers
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const spd = speedRef.current;
      const exp = explosionRef.current;
      const mode = modeRef.current;

      // Color/Energy modulation based on mode
      if (mode === 'overdrive') {
        coreMat.emissive.setHex(0xec4899);
        coreMat.emissiveIntensity = 1.3;
        keyLight.intensity = 4.5;
      } else if (mode === 'stealth') {
        coreMat.emissive.setHex(0x3b82f6);
        coreMat.emissiveIntensity = 0.4;
        keyLight.intensity = 2.0;
      } else {
        // Quantum default
        coreMat.emissive.setHex(0x06b6d4);
        coreMat.emissiveIntensity = 0.85;
        keyLight.intensity = 3.5;
      }

      // Smooth exponential damping on manual rotations
      rootGroup.rotation.y = THREE.MathUtils.damp(
        rootGroup.rotation.y,
        targetRotationY + (isDragging ? 0 : elapsed * 0.25 * spd),
        4.0,
        delta
      );
      rootGroup.rotation.x = THREE.MathUtils.damp(
        rootGroup.rotation.x,
        targetRotationX + Math.sin(elapsed * 0.5) * 0.08,
        4.0,
        delta
      );

      // Core pulsating scale
      const pulse = 1 + Math.sin(elapsed * 2.5 * spd) * 0.04;
      coreMesh.scale.set(pulse, pulse, pulse);
      wireCoreMesh.scale.set(pulse * 1.05, pulse * 1.05, pulse * 1.05);

      // Orbital Rings Rotation
      ring1.rotation.z += 0.8 * delta * spd;
      ring1.rotation.x += 0.4 * delta * spd;
      ring2.rotation.y += 0.6 * delta * spd;
      ring2.rotation.z -= 0.5 * delta * spd;
      ring3.rotation.x -= 0.7 * delta * spd;
      ring3.rotation.y += 0.3 * delta * spd;

      // Holographic Outer Cage rotation
      outerCage.rotation.y -= 0.15 * delta * spd;
      outerCage.rotation.x += 0.1 * delta * spd;

      // Particles rotation
      particles.rotation.y += 0.2 * delta * spd;
      particles.rotation.z += 0.1 * delta * spd;

      // Smooth Explosion / Exploded View Scaling
      const ring1TargetScale = 1 + exp * 0.35;
      const ring2TargetScale = 1 + exp * 0.65;
      const ring3TargetScale = 1 + exp * 0.95;
      const cageTargetScale = 1 + exp * 0.8;

      ring1.scale.setScalar(THREE.MathUtils.damp(ring1.scale.x, ring1TargetScale, 5.0, delta));
      ring2.scale.setScalar(THREE.MathUtils.damp(ring2.scale.x, ring2TargetScale, 5.0, delta));
      ring3.scale.setScalar(THREE.MathUtils.damp(ring3.scale.x, ring3TargetScale, 5.0, delta));
      outerCage.scale.setScalar(THREE.MathUtils.damp(outerCage.scale.x, cageTargetScale, 5.0, delta));

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      coreGeo.dispose();
      coreMat.dispose();
      wireCoreGeo.dispose();
      wireCoreMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      renderer.dispose();
      if (domElem.parentElement) {
        domElem.parentElement.removeChild(domElem);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[450px] md:h-[500px] flex items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/25 bg-gray-950/40 backdrop-blur-md shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Click and drag to rotate the 3D Holographic AI Core"
      />

      {/* Top Spec Badge */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-gray-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 backdrop-blur-md shadow-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        <span>CYBER_CORE // REAL-TIME 3D</span>
        <span className="hidden sm:inline text-gray-500">|</span>
        <span className="hidden sm:inline text-xs text-purple-300">DRAG TO ORBIT</span>
      </div>

      {/* Top-Right Preset Reset Button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5">
        <button
          onClick={() => {
            sound.playClick();
            setExplosionFactor(0.2);
            setSpeedMultiplier(1);
            setCoreMode('quantum');
          }}
          className="p-2 bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-cyan-400 border border-gray-700/60 hover:border-cyan-500/50 rounded-lg text-xs transition backdrop-blur-md"
          title="Reset 3D Core View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Unified Bottom Control Dock */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[560px] transition-all duration-300 ${
          isControlsCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => {
              sound.playClick();
              setIsControlsCollapsed(!isControlsCollapsed);
            }}
            className="flex items-center gap-1.5 bg-gray-950/90 border-t border-x border-cyan-500/30 hover:border-cyan-400 px-3 py-1 rounded-t-md text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition backdrop-blur-md shadow-lg"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-cyan-400" />
                <span>EXPAND CONTROLS</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-cyan-400" />
                <span>COLLAPSE CONTROLS</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-950/90 border border-cyan-500/40 rounded-xl p-3 sm:p-3.5 backdrop-blur-xl shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>CORE MATRIX:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {(['quantum', 'overdrive', 'stealth'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    sound.playClick();
                    setCoreMode(mode);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase rounded transition ${
                    coreMode === mode
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm shadow-cyan-500/30'
                      : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-gray-800/80">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 whitespace-nowrap">
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>EXPLODED:</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explosionFactor}
                onChange={(e) => {
                  setExplosionFactor(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] font-mono text-cyan-300 w-7 text-right">
                {Math.round(explosionFactor * 100)}%
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 sm:hidden">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>SPEED:</span>
              </span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 1.8].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      sound.playClick();
                      setSpeedMultiplier(s);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition ${
                      speedMultiplier === s
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                        : 'bg-gray-900/70 text-gray-400 border border-gray-800 hover:text-gray-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
