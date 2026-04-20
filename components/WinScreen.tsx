"use client";

import React, { useEffect, useRef, useState } from "react";
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

/** One actor node in the chain */
function ActorNode({
  name,
  profileUrl,
  highlight,
  delay,
}: {
  name: string;
  profileUrl?: string | null;
  highlight?: boolean;
  delay: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden
          bg-cinema-card border-[1.5px] flex-shrink-0
          ${highlight ? "border-cinema-gold/60" : "border-white/15"}`}
      >
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={name}
            width={44}
            height={44}
            className="object-cover w-full h-full"
          />
        ) : (
          <span
            className={`text-sm font-bold ${highlight ? "text-cinema-gold" : "text-white/50"}`}
          >
            {initials}
          </span>
        )}
      </div>
      <span
        className={`text-center leading-tight max-w-[72px]
          ${highlight ? "text-cinema-gold" : "text-white/45"}
          uppercase tracking-[0.05em]`}
        style={{ fontSize: 8 }}
      >
        {name}
      </span>
    </motion.div>
  );
}

/** Connector line (thin gold dash) */
function ConnectorLine({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.2, ease: "easeOut" }}
      className="w-3 h-px bg-cinema-gold/30 flex-shrink-0 origin-left"
    />
  );
}

/** Movie poster card in the chain */
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
      {/* Poster */}
      <div className="w-16 h-24 bg-cinema-card border border-white/[0.07] relative overflow-hidden flex-shrink-0">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <>
            {/* Striped placeholder */}
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

      {/* Year */}
      {year && (
        <span className="text-cinema-gold/45 tracking-[0.1em]" style={{ fontSize: 8 }}>
          {year}
        </span>
      )}
    </motion.div>
  );
}

/**
 * Win screen: "★ Movie Connection / Complete" headline +
 * a horizontally-scrolling chain of actor bubbles → movie posters → actor bubbles.
 *
 * Each node animates in with a staggered delay for a cinematic reveal.
 */
export function WinScreen({ moves, startActor, endActor, difficulty, onPlayAgain }: WinScreenProps) {
  // Build the flat node list: actor, [line, movie, line, actor], ...
  type Node =
    | { kind: "actor"; name: string; profileUrl?: string | null; highlight: boolean }
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

  const STEP = 0.1; // seconds between each node reveal

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      {/* Headline */}
      <p
        className="text-center text-cinema-gold/50 uppercase tracking-[0.45em] mb-1"
        style={{ fontSize: 9 }}
      >
        ★ Movie Connection
      </p>
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
        Complete
      </motion.p>
      <p
        className="text-center text-cinema-silver/45 tracking-[0.15em] mb-8"
        style={{ fontSize: 10 }}
      >
        {moves.length} move{moves.length !== 1 ? "s" : ""} &nbsp;·&nbsp; {difficulty}
      </p>

      {/* Scrollable poster chain */}
      <div className="relative mb-8">
        {/* Fade-right hint */}
        <div className="absolute top-0 right-0 bottom-4 w-10 z-10 pointer-events-none bg-gradient-to-r from-transparent to-cinema-black" />

        <div className="flex items-center overflow-x-auto gap-0 pb-4 pr-8" style={{ scrollbarWidth: "none" }}>
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
                profileUrl={node.profileUrl}
                highlight={node.highlight}
                delay={delay}
              />
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPlayAgain}
        className="w-full py-4 border border-cinema-gold text-cinema-gold font-mono
                   text-[10px] uppercase tracking-[0.3em]
                   hover:bg-cinema-gold hover:text-black transition-all duration-200"
      >
        Play Again
      </motion.button>
    </motion.div>
  );
}
