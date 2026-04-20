"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface WrongFlashProps {
  /**
   * Pass a new object each time a wrong answer lands — triggers the sequence.
   * `strikes` is the NEW total after this miss (1, 2, or 3).
   */
  trigger: { strikes: number } | null;
  /**
   * Ref to the element you want to shake (usually the form wrapper or <main>).
   * The `cinema-shake` CSS class is toggled on it for 450ms.
   */
  shakeTargetRef?: React.RefObject<HTMLElement>;
  onDone?: () => void;
}

/**
 * Full-screen cinematic sequence for a wrong answer:
 *   1. Screen shake on shakeTargetRef
 *   2. Red vignette pulses in from edges
 *   3. Giant ✕ STRIKE stamp slams onto screen
 *
 * Mount once near the root of your page.
 */
export function WrongFlash({ trigger, shakeTargetRef, onDone }: WrongFlashProps) {
  const [phase, setPhase] = useState<"idle" | "active" | "exit">("idle");
  const [strikes, setStrikes] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timerRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!trigger) return;

    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    setStrikes(trigger.strikes);

    // Shake the target element
    const target = shakeTargetRef?.current;
    if (target) {
      target.classList.add("cinema-shake");
      const ts = setTimeout(() => target.classList.remove("cinema-shake"), 500);
      timerRef.current.push(ts);
    }

    setPhase("active");

    const t1 = setTimeout(() => setPhase("exit"), 1400);
    const t2 = setTimeout(() => {
      setPhase("idle");
      onDone?.();
    }, 1950);

    timerRef.current.push(t1, t2);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const strikeLabel =
    strikes >= 3 ? "Game Over" : `Strike ${strikes} of 3`;

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="wrong-overlay"
          className="fixed inset-0 z-[195] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          transition={{ duration: phase === "exit" ? 0.5 : 0.15 }}
        >
          {/* Red edge vignette */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, rgba(230,57,70,0.6) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4] }}
            transition={{ duration: 0.8, times: [0, 0.15, 1] }}
          />

          {/* ✕ Stamp */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <motion.span
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 22,
                mass: 0.7,
              }}
              className="text-red-500 leading-none select-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(120px, 22vw, 200px)",
                textShadow: "0 0 60px rgba(230,57,70,0.85)",
              }}
            >
              ✕
            </motion.span>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.25 }}
              className="text-red-500/70 tracking-[0.5em] uppercase select-none"
              style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {strikeLabel}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
