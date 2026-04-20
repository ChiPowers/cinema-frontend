"use client";

import React from "react";
import Image from "next/image";

interface ActorPosterThumbProps {
  /** Movie title to display when no poster image is available */
  movieTitle: string | null;
  /** TMDb poster URL — show image if present, else placeholder */
  posterUrl?: string | null;
  /** Background tint for placeholder, e.g. "#1a3a5c" */
  tint?: string;
}

/**
 * Small poster thumbnail (44×66px) that appears next to the current actor name
 * after each correct move. Slides in with a keyframe animation on mount/change.
 *
 * Usage inside the "current actor" section:
 *
 *   <div className="flex items-center gap-3">
 *     {lastMovie && (
 *       <ActorPosterThumb
 *         movieTitle={lastMovie.movie_title}
 *         posterUrl={lastMovie.poster_url}
 *       />
 *     )}
 *     <div>
 *       <p className="text-white/25 text-[9px] tracking-widest uppercase">Current link</p>
 *       <p className="text-cinema-gold text-xl font-bold">{game.current_actor.name}</p>
 *     </div>
 *   </div>
 *
 * Re-mount (via key prop) to retrigger the slide-in animation each move:
 *   key={game.moves.length}
 */
export function ActorPosterThumb({
  movieTitle,
  posterUrl,
  tint = "#111827",
}: ActorPosterThumbProps) {
  return (
    <div
      className="cinema-actor-thumb"
      style={{ background: tint }}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={movieTitle ?? ""}
          fill
          className="object-cover"
        />
      ) : (
        <>
          <div className="cinema-actor-thumb-fill" />
          <div className="cinema-actor-thumb-overlay" />
          {movieTitle && (
            <div className="cinema-actor-thumb-label">{movieTitle}</div>
          )}
        </>
      )}
    </div>
  );
}
