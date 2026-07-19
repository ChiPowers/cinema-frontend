"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CinematicInput } from "@/components/CinematicInput";
import { CorrectFlash } from "@/components/CorrectFlash";
import { WrongFlash } from "@/components/WrongFlash";
import { WinScreen } from "@/components/WinScreen";
import { LinkProgress } from "@/components/LinkProgress";
import { PosterBackground } from "@/components/PosterBackground";
import { ActorPosterThumb } from "@/components/ActorPosterThumb";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Actor {
  name: string;
  id: number;
  profile_url: string | null;
}

interface Move {
  from_actor: string;
  movie: string;
  to_actor: string;
  movie_title: string | null;
  movie_year: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
}

interface GameState {
  id: string;
  start_actor: Actor;
  end_actor: Actor;
  difficulty: string;
  min_moves: number;
  current_actor: Actor;
  moves: Move[];
  status: "in_progress" | "won" | "lost";
  strikes: number;
}

/* ─── Film reel SVG ─────────────────────────────────────────────── */

function FilmReel({ reverse, goldHub }: { reverse?: boolean; goldHub?: boolean }) {
  const angles = [0, 72, 144, 216, 288];
  return (
    <svg width="90" height="90" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <circle
        cx="70"
        cy="70"
        r="66"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="2.5"
        fill="#111"
      />
      <circle
        cx="70"
        cy="70"
        r="62"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="4"
        strokeDasharray="4 9"
        fill="none"
      />
      <g className={reverse ? "reel-rotating-rev" : "reel-rotating"}>
        {angles.map((deg) => (
          <React.Fragment key={deg}>
            <line
              x1="70"
              y1="70"
              x2="70"
              y2="18"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="7"
              strokeLinecap="round"
              transform={deg ? `rotate(${deg} 70 70)` : undefined}
            />
            <circle
              cx="70"
              cy="24"
              r="7"
              fill="#0a0a0a"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.5"
              transform={deg ? `rotate(${deg} 70 70)` : undefined}
            />
          </React.Fragment>
        ))}
      </g>
      <circle
        cx="70"
        cy="70"
        r="24"
        fill="#1a1a1a"
        stroke={goldHub ? "rgba(245,197,24,0.4)" : "rgba(255,255,255,0.2)"}
        strokeWidth="2"
      />
      <circle
        cx="70"
        cy="70"
        r="5"
        fill="#0a0a0a"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ─── Sprocket holes row ────────────────────────────────────────── */

function SprocketRow({ reverse }: { reverse?: boolean }) {
  return (
    <div className={`tape-scroll${reverse ? " tape-scroll-rev" : ""}`}>
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: "#000",
            border: "1px solid rgba(255,255,255,0.22)",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Reel objective card ───────────────────────────────────────── */

function ReelObjective({
  startActor,
  endActor,
  total,
  completed,
  forgeTrigger,
}: {
  startActor: string;
  endActor: string;
  total: number;
  completed: number;
  forgeTrigger: number;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Actor name row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: 8,
          alignItems: "flex-end",
        }}
      >
        <div style={{ width: 90, textAlign: "center" }}>
          <div
            style={{
              fontSize: 7,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 3,
            }}
          >
            from
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 12,
              lineHeight: 1.2,
              color: "#f5c518",
            }}
          >
            {startActor}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 90, textAlign: "center" }}>
          <div
            style={{
              fontSize: 7,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 3,
            }}
          >
            to
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 12,
              lineHeight: 1.2,
              color: "#fff",
            }}
          >
            {endActor}
          </div>
        </div>
      </div>

      {/* Reels + tape row */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {/* Left reel */}
        <div style={{ flexShrink: 0 }}>
          <FilmReel goldHub />
        </div>

        {/* Filmstrip tape */}
        <div
          style={{
            flex: 1,
            height: 90,
            position: "relative",
            overflow: "visible",
            zIndex: 1,
          }}
        >
          {/* Tape strip */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              height: 28,
              background: "#1a1a1a",
              borderTop: "1px solid rgba(255,255,255,0.14)",
              borderBottom: "1px solid rgba(255,255,255,0.14)",
              overflow: "hidden",
            }}
          >
            {/* Top sprocket holes */}
            <div
              style={{
                position: "absolute",
                top: 3,
                left: 0,
                right: 0,
                height: 8,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <SprocketRow />
            </div>
            {/* Bottom sprocket holes */}
            <div
              style={{
                position: "absolute",
                bottom: 3,
                left: 0,
                right: 0,
                height: 8,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <SprocketRow reverse />
            </div>
          </div>

          {/* Progress dots centered on tape */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              background: "rgba(10,10,10,0.9)",
              padding: "4px 6px",
            }}
          >
            <LinkProgress
              total={total}
              completed={completed}
              forgeTrigger={forgeTrigger}
            />
          </div>
        </div>

        {/* Right reel */}
        <div style={{ flexShrink: 0 }}>
          <FilmReel reverse />
        </div>
      </div>
    </div>
  );
}

/* ─── Strike counter (X marks) ──────────────────────────────────── */

function StrikeCounter({ strikes }: { strikes: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`${strikes} of 3 strikes`}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <line
            x1="2"
            y1="2"
            x2="14"
            y2="14"
            stroke={i < strikes ? "#e63946" : "rgba(255,255,255,0.2)"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="2"
            x2="2"
            y2="14"
            stroke={i < strikes ? "#e63946" : "rgba(255,255,255,0.2)"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}

/* ─── Move card (vertical layout) ───────────────────────────────── */

function MoveCard({
  move,
  index,
  isLast,
  onUndo,
}: {
  move: Move;
  index: number;
  isLast: boolean;
  onUndo?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-stretch gap-3 bg-cinema-card border border-white/5 p-3"
    >
      {/* Poster thumbnail */}
      {move.poster_url ? (
        <Image
          src={move.poster_url}
          alt={move.movie_title ?? ""}
          width={36}
          height={54}
          className="object-cover flex-shrink-0 self-center"
        />
      ) : (
        <div className="w-9 h-14 bg-white/5 flex-shrink-0 self-center flex items-center justify-center">
          <span className="text-white/20 text-xs">?</span>
        </div>
      )}

      {/* Body: from → movie → to */}
      <div className="flex flex-col justify-center min-w-0 flex-1" style={{ gap: 0 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {move.from_actor}
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
          <div
            style={{
              width: 1,
              height: 10,
              background: "rgba(245,197,24,0.25)",
              flexShrink: 0,
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              fontStyle: "italic",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {move.movie_title ?? move.movie}
          </span>
          {move.movie_year && (
            <span
              style={{
                fontSize: 9,
                color: "rgba(245,197,24,0.5)",
                letterSpacing: "0.05em",
                flexShrink: 0,
              }}
            >
              {move.movie_year}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
          <div
            style={{
              width: 1,
              height: 10,
              background: "rgba(245,197,24,0.25)",
              flexShrink: 0,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {move.to_actor}
        </div>
      </div>

      {isLast && onUndo && (
        <button
          onClick={onUndo}
          className="flex-shrink-0 self-start text-white/30 hover:text-cinema-gold text-xs transition-colors px-1"
          title="Undo last move"
        >
          ↩
        </button>
      )}
    </motion.div>
  );
}

/* ─── Streak banner ─────────────────────────────────────────────── */

const STREAK_LABELS = [
  "",
  "",
  "2 in a row! 🎬",
  "3-link combo! 🎞️",
  "On a roll! 🔥",
  "Unstoppable! ⭐",
];

function StreakBanner({ streak }: { streak: number }) {
  if (streak < 2) return null;
  const label =
    STREAK_LABELS[Math.min(streak, STREAK_LABELS.length - 1)] ??
    `${streak} straight! 🎬`;
  return (
    <div className="fixed top-14 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div
        className="streak-pill text-cinema-gold text-xs uppercase tracking-[0.2em] px-3 py-1"
        style={{
          background: "rgba(245,197,24,0.15)",
          border: "1px solid rgba(245,197,24,0.4)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ─── Game page ─────────────────────────────────────────────────── */

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: session } = useSession();
  const [game, setGame] = useState<GameState | null>(null);
  const [movie, setMovie] = useState("");
  const [nextActor, setNextActor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [correctTrigger, setCorrectTrigger] = useState<{
    title: string;
    year?: string | null;
    _key: number;
  } | null>(null);
  const [wrongTrigger, setWrongTrigger] = useState<{
    strikes: number;
    _key: number;
  } | null>(null);
  const [forgeKey, setForgeKey] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakVisible, setStreakVisible] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const streakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movieRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const router = useRouter();

  function authHeaders(): HeadersInit {
    return session?.backendToken
      ? { Authorization: `Bearer ${session.backendToken}` }
      : {};
  }

  useEffect(() => {
    if (!session?.backendToken) return;
    fetch(`${API}/game/${id}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setGame);
  }, [id, session?.backendToken]);

  useEffect(() => {
    if (game?.status === "in_progress") movieRef.current?.focus();
  }, [game?.id, game?.status]);

  function showStreak(count: number) {
    if (count < 2) return;
    setStreakVisible(true);
    if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
    streakTimerRef.current = setTimeout(() => setStreakVisible(false), 2500);
  }

  async function submitMove(e: React.FormEvent) {
    e.preventDefault();
    if (!game || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/game/${id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ movie, next_actor: nextActor }),
      });
      const data = await res.json();

      if (!data.valid) {
        setStreak(0);
        setWrongTrigger({ strikes: data.strikes, _key: Date.now() });
        setTimeout(() => {
          setError(data.explanation);
          setGame((g) =>
            g ? { ...g, strikes: data.strikes, status: data.game_status } : g
          );
        }, 1700);
      } else {
        if (data.backdrop_url) setBackdrop(data.backdrop_url);
        setCorrectTrigger({
          title: data.movie_title ?? movie,
          year: data.movie_year ?? null,
          _key: Date.now(),
        });
        setForgeKey((k) => k + 1);
        setHintText(null);
        setHintUsed(false);

        const newStreak = streak + 1;
        setStreak(newStreak);
        showStreak(newStreak);

        const move: Move = {
          from_actor: game.current_actor.name,
          movie,
          to_actor: nextActor,
          movie_title: data.movie_title,
          movie_year: data.movie_year,
          poster_url: data.poster_url,
          backdrop_url: data.backdrop_url,
        };

        setGame((g) =>
          g
            ? {
                ...g,
                current_actor: data.current_actor,
                moves: [...g.moves, move],
                status: data.game_status,
                strikes: data.strikes,
              }
            : g
        );
        setMovie("");
        setNextActor("");
        setTimeout(() => movieRef.current?.focus(), 50);
      }
    } finally {
      setLoading(false);
    }
  }

  async function undoMove() {
    if (!game || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/game/${id}/move`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      setGame((g) =>
        g
          ? {
              ...g,
              current_actor: data.current_actor,
              moves: data.moves,
              status: data.game_status,
              strikes: data.strikes,
            }
          : g
      );
      setTimeout(() => movieRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }

  async function getHint() {
    if (!game || hintUsed || hintLoading || game.strikes >= 3) return;
    setHintLoading(true);
    try {
      const res = await fetch(`${API}/game/${id}/hint`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHintText(
        data.hint ??
          data.explanation ??
          "Try thinking about films from the late 90s or early 2000s."
      );
      setHintUsed(true);
      if (data.strikes !== undefined) {
        setGame((g) => (g ? { ...g, strikes: data.strikes } : g));
        setWrongTrigger({ strikes: data.strikes, _key: Date.now() });
      }
    } catch {
      setHintText("No hint available right now.");
      setHintUsed(true);
    } finally {
      setHintLoading(false);
    }
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-cinema-silver/50 text-xs tracking-[0.4em] uppercase"
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  const won = game.status === "won";
  const lost = game.status === "lost";

  return (
    <main ref={mainRef} className="min-h-screen flex flex-col">
      {/* Overlays */}
      <CorrectFlash trigger={correctTrigger} />
      <WrongFlash trigger={wrongTrigger} shakeTargetRef={mainRef} />
      <PosterBackground
        entries={game.moves.map((m) => ({
          movie: m.movie_title ?? m.movie,
          year: m.movie_year,
          posterUrl: m.poster_url,
        }))}
      />

      {/* Streak banner */}
      {streakVisible && <StreakBanner streak={streak} />}

      {/* Backdrop */}
      <AnimatePresence mode="wait">
        {backdrop && (
          <motion.div
            key={backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="fixed inset-0 z-0"
          >
            <Image src={backdrop} alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/85 to-cinema-black/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letterbox top */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-black z-20 flex items-center px-5">
        <button
          onClick={() => router.push("/")}
          className="text-cinema-silver/40 text-xs tracking-widest hover:text-cinema-silver transition-colors uppercase"
        >
          ← Exit
        </button>
        <div className="ml-4">
          <StrikeCounter strikes={game.strikes} />
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-cinema-silver/40 uppercase tracking-widest">
          <span>{game.difficulty}</span>
          <span>
            {game.moves.length} link{game.moves.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-black z-20" />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-10 scanlines" />

      <div className="relative z-10 flex flex-col px-8 pt-20 pb-20 max-w-xl mx-auto w-full">
        {/* Reel objective */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <ReelObjective
            startActor={game.start_actor.name}
            endActor={game.end_actor.name}
            total={game.min_moves}
            completed={game.moves.length}
            forgeTrigger={forgeKey}
          />
        </motion.div>

        {/* Move chain */}
        <AnimatePresence>
          {game.moves.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 space-y-2"
            >
              {game.moves.map((m, i) => (
                <MoveCard
                  key={i}
                  move={m}
                  index={i}
                  isLast={i === game.moves.length - 1 && game.status === "in_progress"}
                  onUndo={undoMove}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game states */}
        {won ? (
          <WinScreen
            moves={game.moves}
            startActor={game.start_actor.name}
            endActor={game.end_actor.name}
            difficulty={game.difficulty}
            onPlayAgain={() => router.push("/")}
          />
        ) : lost ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center py-8"
          >
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-red-500 text-3xl font-bold tracking-tight mb-2"
            >
              ✕ Game Over ✕
            </motion.p>
            <p className="text-cinema-silver/60 text-sm mb-1">
              3 strikes &nbsp;·&nbsp; {game.difficulty}
            </p>
            <p className="text-white/40 text-xs mb-8">
              {game.start_actor.name} → {game.end_actor.name}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/")}
              className="px-8 py-3 border border-red-500 text-red-500 text-xs uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
            >
              Try Again
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Current actor */}
            {(() => {
              const lastMove = game.moves[game.moves.length - 1];
              return (
                <motion.div
                  key={game.current_actor.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-5 flex items-center gap-3"
                >
                  {lastMove && (
                    <ActorPosterThumb
                      key={game.moves.length}
                      movieTitle={lastMove.movie_title ?? lastMove.movie}
                      posterUrl={lastMove.poster_url}
                    />
                  )}
                  <div>
                    <p className="text-white/55 text-[9px] tracking-widest uppercase mb-0.5">
                      On screen now
                    </p>
                    <p className="text-cinema-gold text-xl font-bold">
                      {game.current_actor.name}
                    </p>
                  </div>
                </motion.div>
              );
            })()}

            {/* Hint row */}
            <div className="flex justify-end mb-2">
              <button
                onClick={getHint}
                disabled={hintUsed || hintLoading || game.strikes >= 3}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] px-2.5 py-1.5 transition-all disabled:opacity-30"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.45)",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.borderColor = "#f5c518";
                    e.currentTarget.style.color = "#f5c518";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <circle
                    cx="5.5"
                    cy="5.5"
                    r="4.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5.5 3v2.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <circle cx="5.5" cy="8" r=".6" fill="currentColor" />
                </svg>
                {hintUsed ? "Hint used" : hintLoading ? "…" : "Hint"}
                {!hintUsed && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(245,197,24,0.12)",
                      color: "rgba(245,197,24,0.8)",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      padding: "2px 6px",
                      border: "1px solid rgba(245,197,24,0.3)",
                    }}
                  >
                    -1 strike
                  </span>
                )}
              </button>
            </div>

            {/* Hint reveal */}
            <AnimatePresence>
              {hintText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-2"
                >
                  <p
                    className="text-xs leading-relaxed px-3 py-2"
                    style={{
                      color: "rgba(245,197,24,0.85)",
                      border: "1px solid rgba(245,197,24,0.2)",
                      background: "rgba(245,197,24,0.05)",
                    }}
                    dangerouslySetInnerHTML={{ __html: hintText }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Move form */}
            <form onSubmit={submitMove} className="space-y-3">
              <CinematicInput
                label={`A movie featuring ${game.current_actor.name.split(" ")[0]}`}
                takeLabel="TAKE 1"
                value={movie}
                onChange={setMovie}
                placeholder="e.g. The Dark Knight"
                disabled={loading}
                required
                inputRef={movieRef}
              />

              <CinematicInput
                label="A co-star in that movie"
                takeLabel="TAKE 2"
                value={nextActor}
                onChange={setNextActor}
                placeholder="e.g. Heath Ledger"
                disabled={loading}
                required
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[#ff6b6b] text-xs leading-relaxed py-1 border-l-2 border-[#ff6b6b] pl-3">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || !movie.trim() || !nextActor.trim()}
                className="w-full py-4 bg-cinema-gold text-black font-bold text-xs uppercase tracking-[0.3em] disabled:opacity-30 transition-opacity"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-3 h-3 border border-black border-t-transparent rounded-full" />
                    Checking...
                  </span>
                ) : (
                  "Submit Move"
                )}
              </motion.button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
