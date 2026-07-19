"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Move {
  from_actor: string;
  movie_title: string | null;
  movie: string;
  movie_year: string | null;
  to_actor: string;
  poster_url: string | null;
}

interface WinScreenProps {
  moves: Move[];
  startActor: string;
  endActor: string;
  difficulty: string;
  onPlayAgain: () => void;
}

const WIN_QUIPS = [
  "Chain Linked",
  "Six Degrees Mastered",
  "Roll Credits",
  "Print the Cut",
  "That's a Wrap",
  "Hollywood Bows",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Actor node: a dot inside a bordered circle. Endpoints are gold-filled with a glow. */
function ActorNode({
  name,
  highlight,
  delay,
}: {
  name: string;
  highlight?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-[1.5px]"
        style={{
          background: highlight ? "rgba(245,197,24,0.12)" : "rgba(20,20,20,0.6)",
          borderColor: highlight ? "rgba(245,197,24,0.7)" : "rgba(255,255,255,0.15)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          {highlight && (
            <defs>
              <filter id={`dotglow-${name.replace(/\W/g, "")}`}>
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2.5"
                  floodColor="rgba(245,197,24,0.9)"
                />
              </filter>
            </defs>
          )}
          <circle
            cx="9"
            cy="9"
            r={highlight ? 7 : 5}
            fill={highlight ? "#f5c518" : "rgba(255,255,255,0.25)"}
            filter={highlight ? `url(#dotglow-${name.replace(/\W/g, "")})` : undefined}
          />
        </svg>
      </div>
      <span
        className={`text-center leading-tight max-w-[72px] uppercase tracking-[0.05em]
          ${highlight ? "text-cinema-gold" : "text-white/45"}`}
        style={{ fontSize: 8 }}
      >
        {name}
      </span>
    </motion.div>
  );
}

/** Connector: horizontal line with a gold dot at each end (matches v2 winLinkSVG). */
function ConnectorLine({ delay }: { delay: number }) {
  const w = 32;
  const h = 16;
  const cy = 8;
  const r = 4;
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.25, ease: "easeOut" }}
      className="flex-shrink-0 origin-left"
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <line
          x1={r}
          y1={cy}
          x2={w - r}
          y2={cy}
          stroke="rgba(245,197,24,0.45)"
          strokeWidth="1.5"
        />
        <circle
          cx={r}
          cy={cy}
          r={r - 1}
          fill="rgba(245,197,24,0.35)"
          stroke="rgba(245,197,24,0.6)"
          strokeWidth="1.2"
        />
        <circle
          cx={w - r}
          cy={cy}
          r={r - 1}
          fill="rgba(245,197,24,0.35)"
          stroke="rgba(245,197,24,0.6)"
          strokeWidth="1.2"
        />
      </svg>
    </motion.div>
  );
}

/** Movie poster card in the chain (unchanged from prior version). */
function PosterNode({
  title,
  year,
  posterUrl,
  delay,
}: {
  title: string;
  year: string | null;
  posterUrl: string | null;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div className="w-16 h-24 bg-cinema-card border border-white/[0.07] relative overflow-hidden flex-shrink-0">
        {posterUrl ? (
          <Image src={posterUrl} alt={title} fill className="object-cover" />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 4px, transparent 4px, transparent 10px)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1 pb-1 pt-3">
              <p
                className="text-white/70 text-center leading-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 10 }}
              >
                {title}
              </p>
            </div>
          </>
        )}
      </div>
      {year && (
        <span className="text-cinema-gold/45 tracking-[0.1em]" style={{ fontSize: 8 }}>
          {year}
        </span>
      )}
    </motion.div>
  );
}

/**
 * Win screen: "★ {quip}" eyebrow, "Chain Complete" title,
 * "{n} links · {difficulty}" stats, and a horizontally-scrolling chain.
 *
 * The chain alternates: actor dot → connector (line+dots) → poster → connector → actor dot …
 * Endpoint actors (start + end) are gold-filled and glow; intermediate actors are dim white dots.
 */
export function WinScreen({
  moves,
  startActor,
  endActor,
  difficulty,
  onPlayAgain,
}: WinScreenProps) {
  type Node =
    | { kind: "actor"; name: string; highlight: boolean }
    | { kind: "movie"; title: string; year: string | null; posterUrl: string | null }
    | { kind: "line" };

  const nodes: Node[] = [];
  nodes.push({ kind: "actor", name: startActor, highlight: true });

  moves.forEach((m, i) => {
    const isLast = i === moves.length - 1;
    nodes.push({ kind: "line" });
    nodes.push({
      kind: "movie",
      title: m.movie_title ?? m.movie,
      year: m.movie_year,
      posterUrl: m.poster_url,
    });
    nodes.push({ kind: "line" });
    nodes.push({
      kind: "actor",
      name: m.to_actor,
      highlight: isLast,
    });
  });

  const STEP = 0.1;
  const quip = pickRandom(WIN_QUIPS);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      {/* Eyebrow */}
      <p
        className="text-center text-cinema-gold/50 uppercase tracking-[0.45em] mb-1"
        style={{ fontSize: 9 }}
      >
        {"\u2605 "}
        {quip}
      </p>

      {/* Title */}
      <motion.p
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="text-center text-cinema-gold leading-none mb-2"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 44,
          letterSpacing: "0.06em",
          textShadow: "0 0 50px rgba(245,197,24,0.35)",
        }}
      >
        Chain Complete
      </motion.p>

      {/* Stats */}
      <p
        className="text-center text-cinema-silver/45 tracking-[0.15em] mb-8"
        style={{ fontSize: 10 }}
      >
        {moves.length} link{moves.length !== 1 ? "s" : ""}
        {"\u00a0\u00b7\u00a0"}
        {difficulty}
      </p>

      {/* Scrollable poster chain */}
      <div className="relative mb-8">
        {/* Fade-right hint */}
        <div className="absolute top-0 right-0 bottom-4 w-10 z-10 pointer-events-none bg-gradient-to-r from-transparent to-cinema-black" />

        <div
          className="flex items-center overflow-x-auto gap-2 pb-4 pr-8"
          style={{ scrollbarWidth: "none" }}
        >
          {nodes.map((node, idx) => {
            const delay = idx * STEP;
            if (node.kind === "line") return <ConnectorLine key={idx} delay={delay} />;
            if (node.kind === "movie")
              return (
                <PosterNode
                  key={idx}
                  title={node.title}
                  year={node.year}
                  posterUrl={node.posterUrl}
                  delay={delay}
                />
              );
            return (
              <ActorNode
                key={idx}
                name={node.name}
                highlight={node.highlight}
                delay={delay}
              />
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.35 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPlayAgain}
        className="w-full py-4 bg-cinema-gold text-black font-bold
                   text-[10px] uppercase tracking-[0.3em]
                   hover:bg-cinema-gold/90 transition-all duration-200"
      >
        Start a New Game
      </motion.button>
    </motion.div>
  );
}
