/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SupermarketScene, InteractableTarget } from './SupermarketScene';
import { sounds } from '../../game/audio';
import { GameSettings } from '../../types/game';
import { Hand, Compass, Move, Eye, Sparkles, Navigation } from 'lucide-react';

interface GameViewportProps {
  settings: GameSettings;
  onInteract: (target: InteractableTarget) => void;
  activeOverlay: boolean;
  guidedStation: string | null;
  onResetCamera?: () => void;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  settings,
  onInteract,
  activeOverlay,
  guidedStation,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SupermarketScene | null>(null);

  const [nearbyTarget, setNearbyTarget] = useState<InteractableTarget | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [showQuickTeleport, setShowQuickTeleport] = useState<boolean>(false);

  // Joystick state
  const joystickRef = useRef<{ active: boolean; startX: number; startY: number; deltaX: number; deltaY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
  });
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch look state
  const lookTouchRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  // Keyboard keys
  const keysDown = useRef<Record<string, boolean>>({});
  const lastFootstepTime = useRef<number>(0);

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768;
    setIsTouchDevice(isTouch);

    const scene = new SupermarketScene(mountRef.current);
    scene.lookSensitivity = settings.lookSensitivity;
    sceneRef.current = scene;

    scene.onNearbyTargetChange = (target) => {
      setNearbyTarget(target);
    };

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update settings in scene
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.lookSensitivity = settings.lookSensitivity;
    }
  }, [settings.lookSensitivity]);

  // Guided navigation target update
  useEffect(() => {
    if (!sceneRef.current) return;
    if (guidedStation === 'money_station') {
      sceneRef.current.setDestinationWaypoint(sceneRef.current.playerPosition.clone().set(0, 0, -3.2));
    } else if (guidedStation === 'cashier') {
      sceneRef.current.setDestinationWaypoint(sceneRef.current.playerPosition.clone().set(0, 0, 1.4));
    } else if (guidedStation === 'shelves') {
      sceneRef.current.setDestinationWaypoint(sceneRef.current.playerPosition.clone().set(-2.0, 0, -0.5));
    } else {
      sceneRef.current.setDestinationWaypoint(null);
    }
  }, [guidedStation]);

  // Keyboard and Input Loop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeOverlay) return;
      keysDown.current[e.key.toLowerCase()] = true;

      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && nearbyTarget) {
        e.preventDefault();
        sounds.playClick();
        onInteract(nearbyTarget);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Movement animation loop
    let intervalId: number;
    const moveLoop = () => {
      if (!sceneRef.current || activeOverlay) {
        intervalId = requestAnimationFrame(moveLoop);
        return;
      }

      const speed = 0.07;
      let forward = 0;
      let right = 0;

      // Keyboard
      if (keysDown.current['w'] || keysDown.current['arrowup']) forward += speed;
      if (keysDown.current['s'] || keysDown.current['arrowdown']) forward -= speed;
      if (keysDown.current['a'] || keysDown.current['arrowleft']) right -= speed;
      if (keysDown.current['d'] || keysDown.current['arrowright']) right += speed;

      // Joystick input
      if (joystickRef.current.active) {
        const joySpeed = 0.08;
        forward -= joystickRef.current.deltaY * joySpeed;
        right += joystickRef.current.deltaX * joySpeed;
      }

      if (forward !== 0 || right !== 0) {
        sceneRef.current.movePlayer(forward, right);

        // Sound footstep pacing
        const now = performance.now();
        if (now - lastFootstepTime.current > 420) {
          sounds.playFootstep();
          lastFootstepTime.current = now;
        }
      }

      intervalId = requestAnimationFrame(moveLoop);
    };

    intervalId = requestAnimationFrame(moveLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(intervalId);
    };
  }, [activeOverlay, nearbyTarget, onInteract]);

  // Pointer Lock handling for Desktop
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === mountRef.current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== mountRef.current || activeOverlay) return;
      if (!sceneRef.current) return;

      const sensitivity = 0.0022;
      sceneRef.current.rotatePlayer(e.movementX * sensitivity, e.movementY * sensitivity);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeOverlay]);

  const requestLock = useCallback(() => {
    if (activeOverlay || isTouchDevice) return;
    if (mountRef.current && document.pointerLockElement !== mountRef.current) {
      mountRef.current.requestPointerLock?.();
    }
  }, [activeOverlay, isTouchDevice]);

  // Touch look handling (Right half of screen)
  const handleTouchLookStart = (e: React.TouchEvent) => {
    if (activeOverlay) return;
    const touch = e.touches[0];
    lookTouchRef.current = {
      active: true,
      lastX: touch.clientX,
      lastY: touch.clientY,
    };
  };

  const handleTouchLookMove = (e: React.TouchEvent) => {
    if (!lookTouchRef.current.active || !sceneRef.current || activeOverlay) return;
    const touch = e.touches[0];
    const dx = touch.clientX - lookTouchRef.current.lastX;
    const dy = touch.clientY - lookTouchRef.current.lastY;

    lookTouchRef.current.lastX = touch.clientX;
    lookTouchRef.current.lastY = touch.clientY;

    const sensitivity = 0.0045;
    sceneRef.current.rotatePlayer(dx * sensitivity, dy * sensitivity);
  };

  const handleTouchLookEnd = () => {
    lookTouchRef.current.active = false;
  };

  // Joystick touch handlers (Left half)
  const handleJoystickStart = (e: React.TouchEvent) => {
    if (activeOverlay) return;
    const touch = e.touches[0];
    joystickRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
    };
    setJoystickThumb({ x: 0, y: 0 });
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!joystickRef.current.active) return;
    const touch = e.touches[0];
    const maxRadius = 45;
    let dx = touch.clientX - joystickRef.current.startX;
    let dy = touch.clientY - joystickRef.current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    joystickRef.current.deltaX = dx / maxRadius;
    joystickRef.current.deltaY = dy / maxRadius;
    setJoystickThumb({ x: dx, y: dy });
  };

  const handleJoystickEnd = () => {
    joystickRef.current = { active: false, startX: 0, startY: 0, deltaX: 0, deltaY: 0 };
    setJoystickThumb({ x: 0, y: 0 });
  };

  // Teleport helper for guided accessibility
  const teleportPlayer = (locationKey: string) => {
    if (!sceneRef.current) return;
    sounds.playClick();
    switch (locationKey) {
      case 'money_station':
        sceneRef.current.teleportTo(0, -2.6, 0); // facing north
        break;
      case 'bread':
        sceneRef.current.teleportTo(-1.8, -1.2, Math.PI / 2); // facing west
        break;
      case 'drinks':
        sceneRef.current.teleportTo(-1.8, 2.2, Math.PI / 2);
        break;
      case 'stationery':
        sceneRef.current.teleportTo(1.8, -0.6, -Math.PI / 2); // facing east
        break;
      case 'fruits':
        sceneRef.current.teleportTo(1.8, 2.2, -Math.PI / 2);
        break;
      case 'cashier':
        sceneRef.current.teleportTo(0, 3.6, 0); // in front of counter facing North towards cashier!
        break;
      case 'entrance':
      default:
        sceneRef.current.teleportTo(0, 4.5, 0);
        break;
    }
    setShowQuickTeleport(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-900 game-canvas-container">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        onClick={requestLock}
        className="w-full h-full cursor-crosshair"
        data-testid="three-canvas-viewport"
      />

      {/* Desktop Pointer Lock Banner */}
      {!isPointerLocked && !isTouchDevice && !activeOverlay && (
        <div
          onClick={requestLock}
          className="hidden sm:flex absolute top-16 left-1/2 -translate-x-1/2 bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-full shadow-lg cursor-pointer items-center gap-2 text-xs md:text-sm transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Klik untuk pandangan 3D (Guna Tetikus)</span>
        </div>
      )}

      {/* Crosshair (Center) */}
      {!activeOverlay && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white/70 border border-slate-900/60 shadow-sm" />
        </div>
      )}

      {/* Floating Interaction Prompt */}
      {nearbyTarget && !activeOverlay && (
        <div className="absolute bottom-28 md:bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-300 animate-pulse max-w-[90vw]">
          <Hand className="w-6 h-6 text-amber-300 animate-wiggle shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-sm md:text-lg truncate">{nearbyTarget.title}</div>
            <div className="text-xs md:text-sm text-emerald-100 truncate">{nearbyTarget.subtitle}</div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onInteract(nearbyTarget);
            }}
            className="ml-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs md:text-sm shadow cursor-pointer shrink-0"
          >
            PILIH (E)
          </button>
        </div>
      )}

      {/* Guided Navigation Quick Teleport Drawer Button (Accessibility) */}
      {!activeOverlay && (
        <div className="absolute top-16 right-3 sm:top-20 sm:right-4 z-10">
          <button
            onClick={() => setShowQuickTeleport(!showQuickTeleport)}
            className="bg-white/95 hover:bg-white text-emerald-800 font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md border border-emerald-200 flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
            aria-label="Pilih Stesen Pantas"
          >
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span className="hidden xs:inline">Bawa Saya Ke...</span>
            <span className="xs:hidden">Stesen</span>
          </button>

          {showQuickTeleport && (
            <div className="mt-2 w-56 bg-white/95 rounded-2xl shadow-2xl p-3 border border-emerald-200 flex flex-col gap-1.5 text-xs md:text-sm">
              <div className="font-bold text-slate-700 px-2 pb-1 border-b border-slate-200">
                Pilih Destinasi:
              </div>
              <button
                onClick={() => teleportPlayer('money_station')}
                className="text-left px-2.5 py-2 hover:bg-emerald-50 rounded-lg text-emerald-900 font-semibold flex items-center justify-between"
              >
                <span>1. Stesen Kenali Wang</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>
              <button
                onClick={() => teleportPlayer('bread')}
                className="text-left px-2.5 py-2 hover:bg-amber-50 rounded-lg text-amber-900 font-semibold"
              >
                2. Rak Roti (RM2)
              </button>
              <button
                onClick={() => teleportPlayer('drinks')}
                className="text-left px-2.5 py-2 hover:bg-blue-50 rounded-lg text-blue-900 font-semibold"
              >
                3. Rak Susu & Air
              </button>
              <button
                onClick={() => teleportPlayer('stationery')}
                className="text-left px-2.5 py-2 hover:bg-purple-50 rounded-lg text-purple-900 font-semibold"
              >
                4. Rak Alat Tulis
              </button>
              <button
                onClick={() => teleportPlayer('fruits')}
                className="text-left px-2.5 py-2 hover:bg-red-50 rounded-lg text-red-900 font-semibold"
              >
                5. Rak Buah Epal
              </button>
              <button
                onClick={() => teleportPlayer('cashier')}
                className="text-left px-2.5 py-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-950 font-bold"
              >
                6. Kaunter Bayaran
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Touch Drag Area for Look (Right Side) */}
      {isTouchDevice && !activeOverlay && (
        <div
          onTouchStart={handleTouchLookStart}
          onTouchMove={handleTouchLookMove}
          onTouchEnd={handleTouchLookEnd}
          className="absolute top-16 right-0 bottom-24 w-1/2 z-0 flex items-center justify-center pointer-events-auto"
        >
          <div className="opacity-20 text-white flex flex-col items-center pointer-events-none text-xs">
            <Eye className="w-8 h-8 mb-1" />
            <span>Sentuh & Seret untuk Pandang</span>
          </div>
        </div>
      )}

      {/* Mobile Virtual Joystick (Bottom Left) */}
      {isTouchDevice && !activeOverlay && (
        <div
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          className="absolute bottom-6 left-6 w-32 h-32 rounded-full bg-slate-900/40 border-2 border-white/40 flex items-center justify-center z-10 touch-none"
        >
          <div
            className="w-14 h-14 rounded-full bg-emerald-500/80 border-2 border-white shadow-md flex items-center justify-center text-white"
            style={{
              transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
            }}
          >
            <Move className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* Mobile Big Interact Button (Bottom Right) */}
      {isTouchDevice && nearbyTarget && !activeOverlay && (
        <button
          onClick={() => {
            sounds.playClick();
            onInteract(nearbyTarget);
          }}
          className="absolute bottom-6 right-6 w-28 h-28 rounded-full bg-amber-400 border-4 border-white text-slate-950 font-black shadow-2xl flex flex-col items-center justify-center z-10 active:scale-95"
          aria-label="Ambil atau Berinteraksi"
        >
          <Hand className="w-8 h-8 mb-1 text-slate-950" />
          <span className="text-sm font-black">AMBIL</span>
        </button>
      )}

      {/* Bottom Controls Info Banner */}
      {settings.showControlGuides && !isTouchDevice && !activeOverlay && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 text-white/90 px-5 py-2 rounded-xl text-xs flex items-center gap-4 backdrop-blur-none border border-slate-700/50 pointer-events-none">
          <span>
            <strong className="text-amber-400">WASD / Anak Panah:</strong> Gerak
          </span>
          <span>
            <strong className="text-amber-400">Tetikus:</strong> Pandang Sekeliling
          </span>
          <span>
            <strong className="text-amber-400">E / Enter:</strong> Interaksi
          </span>
          <span>
            <strong className="text-amber-400">ESC:</strong> Lepaskan Tetikus
          </span>
        </div>
      )}
    </div>
  );
};
