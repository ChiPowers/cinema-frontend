"use client";

import React, { useEffect, useRef, useState } from "react";

interface LinkProgressProps {
  /** Total links needed to win */
  total: number;
  /** How many have been confirmed so far */
  completed: number;
  /**
   * Pass a new value each time a link is forged.
   * The component animates whichever ring just became completed.
   */
  forgeTrigger?: number;
}

const PERIMETER = 52; // rect perimeter for rx=7, w=14, h=18 (≈ 2*(14-14) + 2*(18-14) + 2π*7)

/**
 * Vertical stack of chain-link oval rings showing progress toward the goal.
 * Rings draw themselves shut ("forge") when a new link is confirmed.
 *
 * Usage:
 *   <LinkProgress total={game.min_moves} completed={game.moves.length} forgeTrigger={forgeKey} />
 *
 * Where `forgeKey` is incremented (e.g. Date.now()) each time a correct move lands.
 */
export function LinkProgress({ total, completed, forgeTrigger }: LinkProgressProps) {
  // Track which ring index to forge next
  const lastCompleted = useRef(completed);
  const [forgingIndex, setForgingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (forgeTrigger === undefined) return;
    if (completed > lastCompleted.current) {
      // The ring that just completed
      setForgingIndex(completed - 1);
      const t = setTimeout(() => setForgingIndex(null), 1500);
      lastCompleted.current = completed;
      return () => clearTimeout(t);
    }
  }, [forgeTrigger, completed]);

  // On reset (completed goes down), sync ref
  useEffect(() => {
    if (completed === 0) lastCompleted.current = 0;
  }, [completed]);

  return (
    <div className="flex flex-col items-center gap-0">
      {Array.from({ length: total }).map((_, i) => {
        const isDone    = i < completed;
        const isForging = i === forgingIndex;
        return (
          <LinkRing
            key={i}
            done={isDone}
            forging={isForging}
          />
        );
      })}
      <span
        className="mt-1.5 tracking-[0.1em] uppercase"
        style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}
      >
        {total} link{total !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

function LinkRing({ done, forging }: { done: boolean; forging: boolean }) {
  const rectRef = useRef<SVGRectElement>(null);

  // When forging starts, reset dashoffset to 52 then let CSS animate to 0
  useEffect(() => {
    const rect = rectRef.current;
    if (!rect || !forging) return;
    rect.setAttribute("stroke-dashoffset", String(PERIMETER));
    // Double rAF ensures the browser registers the starting value
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rect.setAttribute("stroke-dashoffset", "0");
      });
    });
  }, [forging]);

  const color = done || forging ? "#f5c518" : "rgba(255,255,255,0.14)";

  return (
    <svg
      width={18}
      height={22}
      viewBox="0 0 18 22"
      fill="none"
      className={[
        "link-ring-svg",
        done    ? "link-ring-done"   : "link-ring-todo",
        forging ? "link-ring-forging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <rect
        ref={rectRef}
        x={2} y={2}
        width={14} height={18}
        rx={7}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray={PERIMETER}
        strokeDashoffset={done && !forging ? 0 : PERIMETER}
        style={
          forging
            ? { transition: `stroke-dashoffset 0.65s cubic-bezier(0.15,0.85,0.35,1)` }
            : undefined
        }
      />
    </svg>
  );
}
