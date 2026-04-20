"use client";

import React, { useEffect, useRef } from "react";

interface PosterEntry {
  movie: string;
  year: string | null;
  posterUrl?: string | null;
  /** Background tint color when no poster image is available, e.g. "#1a3a5c" */
  tint?: string;
}

interface PosterBackgroundProps {
  /** Pass the full list of confirmed moves; component diffs to add new posters. */
  entries: PosterEntry[];
}

const POSITIONS = [
  { top: "28%", left: "-58px",  rotate: "-8deg",  scale: 1.0  },
  { top: "18%", right: "-52px", rotate: "10deg",  scale: 0.95 },
  { top: "55%", right: "-60px", rotate: "6deg",   scale: 1.05 },
  { top: "50%", left: "-50px",  rotate: "-13deg", scale: 0.9  },
];

/**
 * Renders confirmed movie posters as a layered collage peeking in from
 * the left and right screen edges. Mounts once; adds a new poster card
 * each time `entries` grows.
 *
 * Place this as a direct child of the page's <main> so it can use
 * position:fixed correctly.
 */
export function PosterBackground({ entries }: PosterBackgroundProps) {
  const prevLen = useRef(0);

  // We let CSS handle the animation; just render all entries.
  // New entries get the animation class naturally on first paint.
  useEffect(() => {
    prevLen.current = entries.length;
  });

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {entries.map((entry, idx) => {
        const pos = POSITIONS[idx % POSITIONS.length];
        const style: React.CSSProperties = {
          position: "absolute",
          top: pos.top,
          ...(pos.left  ? { left:  pos.left  } : {}),
          ...(pos.right ? { right: pos.right } : {}),
          // CSS custom property drives both from/to transforms in @keyframes
          ["--poster-rot" as string]: `rotate(${pos.rotate}) scale(${pos.scale})`,
          background: entry.tint ?? "#111827",
        };

        return (
          <div
            key={idx}
            className="cinema-bg-poster"
            style={style}
          >
            {entry.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.posterUrl}
                alt={entry.movie}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                {/* Striped placeholder */}
                <div className="cinema-bg-poster-fill" />
                <div className="cinema-bg-poster-overlay" />
                <div className="cinema-bg-poster-title">
                  {entry.movie}
                  {entry.year && (
                    <span className="cinema-bg-poster-year">{entry.year}</span>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
