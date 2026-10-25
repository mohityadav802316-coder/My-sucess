import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type FXLevel = 'high' | 'low' | 'minimal';

interface BackgroundUniverse3DProps {
  fxLevel: FXLevel;
  warpTrigger?: number; // timestamp to trigger warp streak
}

export const BackgroundUniverse3D: React.FC<BackgroundUniverse3DProps> = ({
  fxLevel,
  warpTrigger = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const warpTimeRef = useRef<number>(0);

  useEffect(() => {
    if (warpTrigger > 0) {
      warpTimeRef.current = performance.now();
    }
  }, [warpTrigger]);

  useEffect(() => {
    if (!mountRef.current || fxLevel === 'minimal') return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0d14, 0.007);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 60;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: fxLevel === 'high',
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, fxLevel === 'high' ? 1.5 : 1.0));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
    } catch (webglErr) {
      console.warn('WebGL initialization failed for BackgroundUniverse3D (falling back to CSS stars):', webglErr);
      return;
    }

    // 2. Starfield Geometry & Counts: High: 4500, Low: 1200
    const starCount = fxLevel === 'high' ? 4500 : 1200;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const twinkleSpeeds = new Float32Array(starCount);
    const originalZ = new Float32Array(starCount);

    const white = new THREE.Color(0xffffff);
    const cyan = new THREE.Color(0x00f2fe);
    const purple = new THREE.Color(0x9b5cff);
    const gold = new THREE.Color(0xffb53d);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 260;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 260;
      const z = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = z;
      originalZ[i] = z;

      twinkleSpeeds[i] = Math.random() * 2.5 + 0.8;
      const rand = Math.random();
      const col = rand < 0.4 ? white : rand < 0.7 ? cyan : rand < 0.88 ? purple : gold;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Procedural Glowing Star Texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(0,242,254,0.9)');
    gradient.addColorStop(0.65, 'rgba(155,92,255,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const starTexture = new THREE.CanvasTexture(canvas);
    const starMaterial = new THREE.PointsMaterial({
      size: fxLevel === 'high' ? 2.2 : 1.8,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starPoints = new THREE.Points(starGeo, starMaterial);
    scene.add(starPoints);

    // 3. Shooting Star streak
    const shootingStarGeo = new THREE.BufferGeometry();
    const shootingStarPos = new Float32Array(6); // 2 vertices line
    shootingStarGeo.setAttribute('position', new THREE.BufferAttribute(shootingStarPos, 3));
    const shootingStarMat = new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0,
      linewidth: 2,
      blending: THREE.AdditiveBlending,
    });
    const shootingStarLine = new THREE.Line(shootingStarGeo, shootingStarMat);
    scene.add(shootingStarLine);

    let isShooting = false;
    let shootingStartTime = 0;
    const shootingStartPos = new THREE.Vector3();
    const shootingDir = new THREE.Vector3();
    let nextShootingTime = performance.now() + Math.random() * 5000 + 4000; // Every 6-12s

    // 4. Subtle Background Nebula Dust Planes
    const nebulaGeo = new THREE.PlaneGeometry(160, 160);
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 128;
    nebulaCanvas.height = 128;
    const nCtx = nebulaCanvas.getContext('2d')!;
    const nGrad = nCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    nGrad.addColorStop(0, 'rgba(155, 92, 255, 0.14)');
    nGrad.addColorStop(0.5, 'rgba(0, 242, 254, 0.08)');
    nGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    nCtx.fillStyle = nGrad;
    nCtx.fillRect(0, 0, 128, 128);

    const nebulaTexture = new THREE.CanvasTexture(nebulaCanvas);
    const nebulaMat = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebulaMesh.position.z = -60;
    scene.add(nebulaMesh);

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Subtle rotation of starfield
      starPoints.rotation.y += 0.0003 * (delta * 60);
      starPoints.rotation.x += 0.00015 * (delta * 60);
      nebulaMesh.rotation.z += 0.0002 * (delta * 60);

      // Parallax read from CSS variables --rx and --ry (from Gyroscope / Pointer)
      const rx = parseFloat(document.documentElement.style.getPropertyValue('--rx') || '0');
      const ry = parseFloat(document.documentElement.style.getPropertyValue('--ry') || '0');
      camera.position.x += ((ry * 0.4) - camera.position.x) * 0.05;
      camera.position.y += ((-rx * 0.4) - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Warp Effect check: if warp triggered recently (~500ms duration)
      const elapsedWarp = time - warpTimeRef.current;
      const isWarping = elapsedWarp > 0 && elapsedWarp < 600;
      const posArray = starGeo.attributes.position.array as Float32Array;

      if (isWarping) {
        const warpProgress = Math.sin((elapsedWarp / 600) * Math.PI);
        const stretchZ = warpProgress * 25;
        for (let i = 0; i < starCount; i += 4) {
          posArray[i * 3 + 2] = originalZ[i] + stretchZ;
        }
        starGeo.attributes.position.needsUpdate = true;
      }

      // Shooting Star Logic
      if (!isShooting && time > nextShootingTime) {
        isShooting = true;
        shootingStartTime = time;
        shootingStartPos.set(
          (Math.random() - 0.5) * 80 + 20,
          Math.random() * 40 + 10,
          (Math.random() - 0.5) * 30 + 10
        );
        shootingDir.set(-1.4 - Math.random() * 0.6, -1.0 - Math.random() * 0.4, 0).normalize();
        nextShootingTime = time + Math.random() * 6000 + 6000; // 6-12s
      }

      if (isShooting) {
        const shootElapsed = time - shootingStartTime;
        const shootDuration = 550; // 550ms rapid streak
        if (shootElapsed > shootDuration) {
          isShooting = false;
          shootingStarMat.opacity = 0;
        } else {
          const progress = shootElapsed / shootDuration;
          const currentHead = shootingStartPos.clone().addScaledVector(shootingDir, progress * 90);
          const currentTail = shootingStartPos.clone().addScaledVector(shootingDir, Math.max(0, (progress - 0.25) * 90));

          const linePos = shootingStarGeo.attributes.position.array as Float32Array;
          linePos[0] = currentTail.x;
          linePos[1] = currentTail.y;
          linePos[2] = currentTail.z;
          linePos[3] = currentHead.x;
          linePos[4] = currentHead.y;
          linePos[5] = currentHead.z;
          shootingStarGeo.attributes.position.needsUpdate = true;

          const fade = Math.sin(progress * Math.PI);
          shootingStarMat.opacity = fade * 0.9;
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      starGeo.dispose();
      starMaterial.dispose();
      starTexture.dispose();
      shootingStarGeo.dispose();
      shootingStarMat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
      nebulaTexture.dispose();
      renderer.dispose();
    };
  }, [fxLevel]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
