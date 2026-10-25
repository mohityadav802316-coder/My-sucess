/**
 * 3D Gyroscope & Pointer Parallax Manager
 * Supports DeviceOrientation with iOS permission handling, lerp smoothing,
 * calibration, and pointer/drag fallback.
 */

interface TiltState {
  rx: number; // Pitch rotation in degrees
  ry: number; // Yaw/roll rotation in degrees
  tx: number; // Target pitch
  ty: number; // Target roll
  hasDeviceOrientation: boolean;
  isCalibrated: boolean;
  baseBeta: number;
}

const state: TiltState = {
  rx: 0,
  ry: 0,
  tx: 0,
  ty: 0,
  hasDeviceOrientation: false,
  isCalibrated: false,
  baseBeta: 50, // Standard phone reading angle ~50°
};

let isInitialized = false;
let animationId = 0;

const clamp = (val: number, max: number) => Math.max(-max, Math.min(max, val));

export function initTilt() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // 1. Device Orientation Listener
  const bindOrientation = () => {
    window.addEventListener(
      'deviceorientation',
      (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        state.hasDeviceOrientation = true;
        if (!state.isCalibrated) {
          state.baseBeta = e.beta;
          state.isCalibrated = true;
        }

        const deltaGamma = e.gamma;
        const deltaBeta = e.beta - state.baseBeta;

        // Max ±18° as specified
        state.ty = clamp(deltaGamma / 2.2, 18);
        state.tx = clamp(-deltaBeta / 2.2, 18);
      },
      { passive: true }
    );
  };

  // iOS 13+ requires explicit permission request during user gesture
  const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };

  if (typeof DeviceOrientationEventAny?.requestPermission === 'function') {
    DeviceOrientationEventAny.requestPermission()
      .then((perm) => {
        if (perm === 'granted') {
          bindOrientation();
        }
      })
      .catch(() => {
        // Fallback to touch / pointer if permission is denied
      });
  } else {
    bindOrientation();
  }

  // 2. Desktop pointer / mouse move fallback
  window.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      if (state.hasDeviceOrientation || e.pointerType === 'touch') return;
      const x = (e.clientX / window.innerWidth - 0.5) * 26;
      const y = -(e.clientY / window.innerHeight - 0.5) * 20;
      state.ty = clamp(x, 18);
      state.tx = clamp(y, 18);
    },
    { passive: true }
  );

  // 3. Smooth Lerp Animation Loop (~0.1 lerp)
  const loop = () => {
    if (!document.hidden) {
      state.rx += (state.tx - state.rx) * 0.1;
      state.ry += (state.ty - state.ry) * 0.1;

      // Update CSS variables --rx and --ry on document root
      document.documentElement.style.setProperty('--rx', state.rx.toFixed(2));
      document.documentElement.style.setProperty('--ry', state.ry.toFixed(2));
    }
    animationId = requestAnimationFrame(loop);
  };

  animationId = requestAnimationFrame(loop);
}

export function requestGyroPermission() {
  const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  if (typeof DeviceOrientationEventAny?.requestPermission === 'function') {
    DeviceOrientationEventAny.requestPermission().catch(() => {});
  }
}
