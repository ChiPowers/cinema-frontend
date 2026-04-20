"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CorrectFlashProps {
  /** Pass a new value each time a correct move lands — triggers the sequence. */
  trigger: { title: string; year?: string | null } | null;
  onDone?: () => void;
}

/**
 * Full-screen cinematic sequence for a correct answer:
 *   1. Projector-cut white flash
 *   2. Title card slams in (Bebas Neue, gold, spring physics)
 *   3. Spotlight sweep behind the title
 *
 * Mount once near the root of your page and pass `trigger` whenever a move succeeds.
 */
export function CorrectFlash({ trigger, onDone }: CorrectFlashProps) {
  const [phase, setPhase] = useState<"idle" | "flash" | "title" | "exit">("idle");
  const [current, setCurrent] = useState<{ title: string; year?: string | null } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all pending timers on unmount
  useEffect(() => () => timerRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!trigger) return;

    // Cancel any in-flight sequence
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    setCurrent(trigger);
    setPhase("flash");

    const t1 = setTimeout(() => setPhase("title"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2300);
    const t3 = setTimeout(() => {
      setPhase("idle");
      onDone?.();
    }, 2900);

    timerRef.current = [t1, t2, t3];
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* 1. Projector-cut white flash */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-[200] bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.55, times: [0, 0.08, 1] }}
          />
        )}
      </AnimatePresence>

      {/* 2. Title card */}
      <AnimatePresence>
        {(phase === "title" || phase === "exit") && current && (
          <motion.div
            key="title-card"
            className="fixed inset-0 z-[190] flex flex-col items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "exit" ? 0 : 1 }}
            transition={{ duration: phase === "exit" ? 0.55 : 0.15 }}
          >
            {/* Spotlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 520px 300px at 50% 50%, rgba(245,197,24,0.07) 0%, transparent 70%)",
                animation: "spotlightFade 2.5s ease forwards",
              }}
            />

            {/* Movie title — slams in */}
            <motion.div
              initial={{ scale: 1.45, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.8 }}
              className="relative text-center px-8"
            >
              <p
                className="text-cinema-gold leading-none text-center"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(52px, 10vw, 96px)",
                  textShadow:
                    "0 0 80px rgba(245,197,24,0.6), 0 0 160px rgba(245,197,24,0.25)",
                  letterSpacing: "0.04em",
                }}
              >
                {current.title}
              </p>
              {current.year && (
                <p
                  className="mt-2 text-cinema-gold/50 tracking-[0.4em] uppercase"
                  style={{ fontSize: 13 }}
                >
                  {current.year}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
