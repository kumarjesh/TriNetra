// ============================================================
// TriNetra — useGestures Hook (Blind-First Touch Engine)
// ============================================================
// Robust full-screen gesture recognition designed specifically for
// visually impaired users. Eliminates false swipes caused by multi-finger
// landing/lifting micro-delays by tracking individual touch points.
//
// Supports:
// - Single tap: toggle scanning
// - Double tap: repeat hazard summary
// - Triple tap: emergency pause
// - Three-finger tap: emergency pause
// - Long press (1 finger): cycle verbosity mode
// - Two-finger long press: open / close settings
// - Two-finger tap: Google Gemini Multimodal Scene AI
// - Two-finger double tap: currency / banknote reader
// - Swipes (1 finger): up (torch), down (status), left (theme), right (audio mode)
// - Swipes (2 fingers): up (OCR), down (light detector), left/right (find target)
// - Swipes (3 fingers): left/right (cycle language)

import { useCallback, useEffect, useRef } from 'react';

export type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe-up'
  | 'swipe-down'
  | 'swipe-left'
  | 'swipe-right'
  | 'two-finger-tap'
  | 'two-finger-double-tap'
  | 'two-finger-long-press'
  | 'two-finger-swipe-up'
  | 'two-finger-swipe-down'
  | 'two-finger-swipe-left'
  | 'two-finger-swipe-right'
  | 'three-finger-tap'
  | 'three-finger-swipe-left'
  | 'three-finger-swipe-right';

interface GestureCallbacks {
  onGesture: (gesture: GestureType) => void;
}

/** Minimum displacement (px) for a deliberate swipe */
const SWIPE_THRESHOLD = 50;
/** Max time (ms) between taps for multi-tap detection */
const MULTI_TAP_WINDOW = 350;
/** Debounce delay (ms) to confirm single or double tap */
const TAP_DEBOUNCE_DELAY = 280;
/** Hold duration (ms) for long-press */
const LONG_PRESS_DELAY = 600;
/** Maximum allowed movement (px) during a stationary hold or tap */
const HOLD_JITTER_TOLERANCE = 40;

interface TouchPoint {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

interface GestureSession {
  touches: Map<number, TouchPoint>;
  startTime: number;
  maxFingers: number;
  longPressFired: boolean;
  moved: boolean;
}

export function useGestures(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: GestureCallbacks
) {
  const sessionRef = useRef<GestureSession | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Multi-tap buffer (tracks consecutive taps: 1 = single, 2 = double, 3 = triple)
  const tapCountRef = useRef(0);
  const tapFingersRef = useRef(1);
  const tapDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTimeRef = useRef(0);

  const { onGesture } = callbacks;

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      const currentTouchCount = e.touches.length;

      if (!sessionRef.current) {
        // Start a brand-new gesture session
        const touchMap = new Map<number, TouchPoint>();
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          touchMap.set(t.identifier, {
            startX: t.clientX,
            startY: t.clientY,
            lastX: t.clientX,
            lastY: t.clientY,
          });
        }

        sessionRef.current = {
          touches: touchMap,
          startTime: Date.now(),
          maxFingers: currentTouchCount,
          longPressFired: false,
          moved: false,
        };

        // Start long-press timer
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = setTimeout(() => {
          const session = sessionRef.current;
          if (session && !session.longPressFired && !session.moved) {
            session.longPressFired = true;

            // Tactile feedback signaling the hold triggered
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(60);
              } catch {
                // Ignore vibration failure
              }
            }

            if (session.maxFingers >= 2) {
              onGesture('two-finger-long-press');
            } else {
              onGesture('long-press');
            }
          }
        }, LONG_PRESS_DELAY);
      } else {
        // Additional fingers placed down during existing session
        const session = sessionRef.current;
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          if (!session.touches.has(t.identifier)) {
            session.touches.set(t.identifier, {
              startX: t.clientX,
              startY: t.clientY,
              lastX: t.clientX,
              lastY: t.clientY,
            });
          }
        }
        session.maxFingers = Math.max(session.maxFingers, currentTouchCount);
      }
    },
    [onGesture]
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const session = sessionRef.current;
    if (!session) return;

    // Update positions of active touches
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      const pt = session.touches.get(t.identifier);
      if (pt) {
        pt.lastX = t.clientX;
        pt.lastY = t.clientY;
      }
    }

    // Measure maximum displacement of any individual finger from its starting point
    let maxDisplacement = 0;
    session.touches.forEach((pt) => {
      const d = Math.hypot(pt.lastX - pt.startX, pt.lastY - pt.startY);
      if (d > maxDisplacement) maxDisplacement = d;
    });

    // If fingers moved beyond tolerance, cancel stationary long-press timer
    if (maxDisplacement > HOLD_JITTER_TOLERANCE) {
      session.moved = true;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();

      // Wait until ALL fingers lift off before evaluating the complete gesture
      if (e.touches.length > 0) {
        return;
      }

      // Cancel long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const session = sessionRef.current;
      sessionRef.current = null;
      if (!session) return;

      // If long press already fired while holding down, consume and exit
      if (session.longPressFired) {
        tapCountRef.current = 0;
        if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
        return;
      }

      // Compute aggregate displacement across fingers
      let totalDx = 0;
      let totalDy = 0;
      let count = 0;
      let maxTravel = 0;

      session.touches.forEach((pt) => {
        const dx = pt.lastX - pt.startX;
        const dy = pt.lastY - pt.startY;
        totalDx += dx;
        totalDy += dy;
        count++;
        const dist = Math.hypot(dx, dy);
        if (dist > maxTravel) maxTravel = dist;
      });

      const avgDx = count > 0 ? totalDx / count : 0;
      const avgDy = count > 0 ? totalDy / count : 0;
      const fingers = session.maxFingers;

      // ============================================================
      // 1. Deliberate Swipe Detection
      // ============================================================
      if (maxTravel > SWIPE_THRESHOLD && Math.hypot(avgDx, avgDy) > 35) {
        // Reset tap buffer
        tapCountRef.current = 0;
        if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);

        const isHorizontal = Math.abs(avgDx) > Math.abs(avgDy);

        if (fingers >= 3) {
          if (isHorizontal) {
            onGesture(avgDx > 0 ? 'three-finger-swipe-right' : 'three-finger-swipe-left');
          }
        } else if (fingers === 2) {
          if (isHorizontal) {
            onGesture(avgDx > 0 ? 'two-finger-swipe-right' : 'two-finger-swipe-left');
          } else {
            onGesture(avgDy > 0 ? 'two-finger-swipe-down' : 'two-finger-swipe-up');
          }
        } else {
          if (isHorizontal) {
            onGesture(avgDx > 0 ? 'swipe-right' : 'swipe-left');
          } else {
            onGesture(avgDy > 0 ? 'swipe-down' : 'swipe-up');
          }
        }
        return;
      }

      // ============================================================
      // 2. Three-Finger Tap -> Immediate Emergency Pause
      // ============================================================
      if (fingers >= 3) {
        tapCountRef.current = 0;
        if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
        onGesture('three-finger-tap');
        return;
      }

      // ============================================================
      // 3. Two-Finger Tap & Two-Finger Double Tap
      // ============================================================
      if (fingers === 2) {
        const now = Date.now();
        const isDouble =
          tapFingersRef.current === 2 &&
          tapCountRef.current === 1 &&
          now - lastTapTimeRef.current < MULTI_TAP_WINDOW;

        if (isDouble) {
          // Second two-finger tap in window -> Two-Finger Double-Tap (Currency Reader)
          if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
          tapCountRef.current = 0;
          tapFingersRef.current = 1;
          onGesture('two-finger-double-tap');
        } else {
          // First two-finger tap -> Buffer and wait for potential double-tap
          tapCountRef.current = 1;
          tapFingersRef.current = 2;
          lastTapTimeRef.current = now;

          if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
          tapDebounceTimerRef.current = setTimeout(() => {
            tapCountRef.current = 0;
            tapFingersRef.current = 1;
            // Debounced single two-finger tap -> Google Gemini Scene AI
            onGesture('two-finger-tap');
          }, TAP_DEBOUNCE_DELAY);
        }
        return;
      }

      // ============================================================
      // 4. Single-Finger Taps (Single, Double, or Triple Emergency Tap)
      // ============================================================
      const now = Date.now();
      const inWindow =
        tapFingersRef.current === 1 &&
        tapCountRef.current > 0 &&
        now - lastTapTimeRef.current < MULTI_TAP_WINDOW;

      if (inWindow) {
        tapCountRef.current += 1;
        lastTapTimeRef.current = now;

        if (tapCountRef.current >= 3) {
          // Triple tap -> Emergency Pause!
          if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
          tapCountRef.current = 0;
          onGesture('three-finger-tap'); // Triggers emergency pause!
          return;
        }

        // Tap 2: wait briefly to see if tap 3 follows
        if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
        tapDebounceTimerRef.current = setTimeout(() => {
          if (tapCountRef.current === 2) {
            onGesture('double-tap');
          }
          tapCountRef.current = 0;
        }, TAP_DEBOUNCE_DELAY);
      } else {
        // First tap of a new cycle
        tapCountRef.current = 1;
        tapFingersRef.current = 1;
        lastTapTimeRef.current = now;

        if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
        tapDebounceTimerRef.current = setTimeout(() => {
          if (tapCountRef.current === 1) {
            onGesture('tap');
          }
          tapCountRef.current = 0;
        }, TAP_DEBOUNCE_DELAY);
      }
    },
    [onGesture]
  );

  const handleTouchCancel = useCallback(() => {
    sessionRef.current = null;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchcancel', handleTouchCancel);
      if (tapDebounceTimerRef.current) clearTimeout(tapDebounceTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, [elementRef, handleTouchStart, handleTouchEnd, handleTouchMove, handleTouchCancel]);
}
