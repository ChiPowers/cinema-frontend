"use client";

import React, { useEffect, useRef, useState } from "react";

interface LinkProgressProps {
  total: number;
  completed: number;
  forgeTrigger?: number;
}

export function LinkProgress({ total, completed, forgeTrigger }: LinkProgressProps) {
  const lastCompleted = useRef(completed);
  const [forgingIndex, setForgingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (forgeTrigger === undefined) return;
    if (completed > lastCompleted.current) {
      setForgingIndex(completed - 1);
      const t = setTimeout(() => setForgingIndex(null), 1500);
      lastCompleted.current = completed;
      return () => clearTimeout(t);
    }
  }, [forgeTrigger, completed]);

  useEffect(() => {
    if (completed === 0) lastCompleted.current = 0;
  }, [completed]);

  const r = 5;
  const gap = 11;
  const cx = 12;
  const svgH = (total - 1) * gap + r * 2 + 4;

  return (
    <svg
      width="24"
      height={svgH}
      viewBox={`0 0 24 ${svgH}`}
      fill="none"
      overflow="visible"
    >
      {/* Connecting lines (behind dots) */}
      {Array.from({ length: total - 1 }).map((_, i) => {
        const done = i < completed;
        const y1 = 2 + r + i * gap;
        const y2 = y1 + gap;
        return (
          <line
            key={`line-${i}`}
            x1={cx}
            y1={y1}
            x2={cx}
            y2={y2}
            stroke={done ? "rgba(245,197,24,0.6)" : "rgba(255,255,255,0.15)"}
            strokeWidth="2"
            strokeDasharray={done ? undefined : "3,3"}
          />
        );
      })}

      {/* Dots on top */}
      {Array.from({ length: total }).map((_, i) => {
        const done = i < completed;
        const isForging = i === forgingIndex;
        const cy = 2 + r + i * gap;
        return (
          <circle
            key={`dot-${i}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={done ? "#f5c518" : "none"}
            stroke={done ? "#f5c518" : "rgba(255,255,255,0.25)"}
            strokeWidth="2"
            className={isForging ? "link-ring-forging" : done ? "link-ring-done" : ""}
          />
        );
      })}
    </svg>
  );
}
