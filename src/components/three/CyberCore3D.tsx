
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { sound } from '../audio/SoundEffects';

interface CyberCore3DProps {
  onInteraction?: () => void;
}

export const CyberCore3D: React.FC<CyberCore3DProps> = ({
  onInteraction,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef(onInteraction);

  useEffect(() => {
    interactionRef.current = onInteraction;
  }, [onInteraction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;

    // Respect device motion preferences
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Scene
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );

    camera.position.set(0, 0, 5.5);

    // Renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      container.appendChild(renderer.domElement);
    } catch (error) {
      console.warn('CyberCore3D: WebGL initialization failed.', error);
      return;
    }

    // Premium Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xd4af37, 35, 15);
    goldLight.position.set(-3, 3, 4);
    scene.add(goldLight);

    const silverLight = new THREE.DirectionalLight(0xe5e7eb, 2.2);
    silverLight.position.set(4, 2, 5);
    scene.add(silverLight);

    const rimLight = new THREE.PointLight(0xb8860b, 22, 12);
    rimLight.position.set(2, -3, -3);
    scene.add(rimLight);

    // Main Luxury Gold Core
    const coreGeometry = new THREE.SphereGeometry(1.35, 64, 64);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc9a227,
      metalness: 0.92,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      emissive: 0x3b2b08,
      emissiveIntensity: 0.16,
      reflectivity: 1,
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Subtle metallic highlight layer
    const highlightGeometry = new THREE.SphereGeometry(
      1.355,
      48,
      48
    );

    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdf85,
      wireframe: true,
      transparent: true,
      opacity: 0.045,
    });

    const highlightMesh = new THREE.Mesh(
      highlightGeometry,
      highlightMaterial
    );

    core.add(highlightMesh);

    // Soft ambient golden glow
    const glowGeometry = new THREE.SphereGeometry(1.65, 32, 32);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0.055,
      side: THREE.BackSide,
      depthWrite: false,
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Mouse and Touch Interaction
    let isDragging = false;
    let activePointerId: number | null = null;

    let previousX = 0;
    let previousY = 0;

    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      activePointerId = event.pointerId;

      previousX = event.clientX;
      previousY = event.clientY;

      renderer.domElement.setPointerCapture(event.pointerId);

      sound.playClick();
      interactionRef.current?.();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== activePointerId) return;

      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      // Keep vertical rotation within comfortable limits
      targetRotationX = THREE.MathUtils.clamp(
        targetRotationX,
        -1.1,
        1.1
      );

      previousX = event.clientX;
      previousY = event.clientY;
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;

      isDragging = false;
      activePointerId = null;

      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    const domElement = renderer.domElement;

    domElement.style.touchAction = 'pan-y';

    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('pointercancel', handlePointerUp);

    // Animation
    const clock = new THREE.Clock();

    let animationId = 0;
    let isVisible = !document.hidden;
    let isDisposed = false;

    const render = () => {
      if (isDisposed || !isVisible) return;

      animationId = requestAnimationFrame(render);

      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        if (!isDragging) {
          targetRotationY += 0.0018;
        }

        core.rotation.y = THREE.MathUtils.lerp(
          core.rotation.y,
          targetRotationY,
          0.045
        );

        core.rotation.x = THREE.MathUtils.lerp(
          core.rotation.x,
          targetRotationX + Math.sin(elapsed * 0.35) * 0.035,
          0.045
        );

        const pulse = 1 + Math.sin(elapsed * 1.2) * 0.012;

        core.scale.setScalar(pulse);
        glow.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.025);
      } else {
        core.rotation.y = targetRotationY;
        core.rotation.x = targetRotationX;
      }

      renderer.render(scene, camera);
    };

    const startAnimation = () => {
      if (isDisposed || !isVisible) return;

      cancelAnimationFrame(animationId);

      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      } else {
        clock.start();
        render();
      }
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;

      if (isVisible) {
        startAnimation();
      } else {
        cancelAnimationFrame(animationId);
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    // Responsive Canvas
    const resizeObserver = new ResizeObserver(() => {
      if (!container.clientWidth || !container.clientHeight) return;

      camera.aspect =
        container.clientWidth / container.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
    });

    resizeObserver.observe(container);

    // Start
    startAnimation();

    // Cleanup
    return () => {
      isDisposed = true;

      cancelAnimationFrame(animationId);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      resizeObserver.disconnect();

      domElement.removeEventListener(
        'pointerdown',
        handlePointerDown
      );

      domElement.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      domElement.removeEventListener(
        'pointerup',
        handlePointerUp
      );

      domElement.removeEventListener(
        'pointercancel',
        handlePointerUp
      );

      coreGeometry.dispose();
      coreMaterial.dispose();

      highlightGeometry.dispose();
      highlightMaterial.dispose();

      glowGeometry.dispose();
      glowMaterial.dispose();

      renderer.dispose();

      if (domElement.parentElement === container) {
        container.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      className="
        relative
        flex
        w-full
        h-[380px]
        sm:h-[450px]
        md:h-[500px]
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        border
        border-[#c9a227]/20
        bg-[#050505]
        shadow-[0_20px_80px_rgba(0,0,0,0.5)]
      "
    >
      {/* Subtle Luxury Background */}
      <div
        className="
          absolute
          inset-0
          pointer-events-none
          bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.09)_0%,transparent_65%)]
        "
      />

      {/* Soft Silver Highlight */}
      <div
        className="
          absolute
          inset-0
          pointer-events-none
          bg-[radial-gradient(ellipse_at_70%_25%,rgba(220,220,220,0.035),transparent_45%)]
        "
      />

      {/* 3D Core */}
      <div
        ref={containerRef}
        className="
          relative
          z-10
          w-full
          h-full
          cursor-grab
          active:cursor-grabbing
          select-none
        "
        title="Drag to rotate the Luxury 3D Core"
        aria-label="Interactive golden 3D core"
      />

      {/* Minimal Label */}
      <div
        className="
          absolute
          bottom-5
          left-0
          right-0
          z-20
          flex
          justify-center
          pointer-events-none
        "
      >
        <span
          className="
            px-4
            py-1.5
            rounded-full
            border
            border-[#c9a227]/20
            bg-black/40
            text-[10px]
            sm:text-xs
            tracking-[0.3em]
            uppercase
            text-[#d4af37]/75
            backdrop-blur-md
          "
        >
          CYBER MOHIT · AI CORE
        </span>
      </div>
    </div>
  );
};

export default CyberCore3D;
