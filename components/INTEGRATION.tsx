/**
 * INTEGRATION GUIDE — app/game/[id]/page.tsx  (v2)
 * ─────────────────────────────────────────────────────────────────
 * Components to copy into your project:
 *
 *   components/CinematicInput.tsx      ← viewfinder inputs (unchanged)
 *   components/CorrectFlash.tsx        ← projector flash + title slam (unchanged)
 *   components/WrongFlash.tsx          ← shake + vignette + strike stamp (unchanged)
 *   components/WinScreen.tsx           ← poster chain win screen (unchanged)
 *   components/LinkProgress.tsx        ← NEW: forging chain ring progress
 *   components/PosterBackground.tsx    ← NEW: background poster collage
 *   components/ActorPosterThumb.tsx    ← NEW: poster thumb next to actor name
 *   components/cinematic.css           ← all keyframes + utility classes
 *
 * In app/globals.css add:
 *   @import "../components/cinematic.css";
 *
 * In app/layout.tsx <head> add:
 *   <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
 * ─────────────────────────────────────────────────────────────────
 */

// ══════════════════════════════════════════════════════════════════
// STEP A — imports
// ══════════════════════════════════════════════════════════════════

import { CinematicInput }    from "@/components/CinematicInput";
import { CorrectFlash }      from "@/components/CorrectFlash";
import { WrongFlash }        from "@/components/WrongFlash";
import { WinScreen }         from "@/components/WinScreen";
import { LinkProgress }      from "@/components/LinkProgress";
import { PosterBackground }  from "@/components/PosterBackground";
import { ActorPosterThumb }  from "@/components/ActorPosterThumb";

// ══════════════════════════════════════════════════════════════════
// STEP B — state additions inside GamePage
// ══════════════════════════════════════════════════════════════════

const mainRef = useRef<HTMLElement>(null);

// Replace flashTitle / showStrikeFlash with:
const [correctTrigger, setCorrectTrigger] = useState<
  { title: string; year?: string | null; _key: number } | null
>(null);
const [wrongTrigger, setWrongTrigger] = useState<
  { strikes: number; _key: number } | null
>(null);
// Incremented on each correct move to trigger the forge animation:
const [forgeKey, setForgeKey] = useState(0);

// ══════════════════════════════════════════════════════════════════
// STEP C — submitMove changes
// ══════════════════════════════════════════════════════════════════

// REPLACE the invalid-move block:
if (!data.valid) {
  setWrongTrigger({ strikes: data.strikes, _key: Date.now() });
  setTimeout(() => {
    setError(data.explanation);
    setGame((g) =>
      g ? { ...g, strikes: data.strikes, status: data.game_status } : g
    );
  }, 1700);
}

// REPLACE the valid-move block's backdrop/flash lines:
if (data.backdrop_url) setBackdrop(data.backdrop_url);
setCorrectTrigger({ title: data.movie_title ?? movie, year: data.movie_year ?? null, _key: Date.now() });
setForgeKey((k) => k + 1); // triggers LinkProgress forge animation

// ══════════════════════════════════════════════════════════════════
// STEP D — add ref to <main>
// ══════════════════════════════════════════════════════════════════

// <main ref={mainRef} className="min-h-screen flex flex-col">

// ══════════════════════════════════════════════════════════════════
// STEP E — overlay components (near top of JSX, before backdrop div)
// ══════════════════════════════════════════════════════════════════

<>
  <CorrectFlash
    trigger={correctTrigger ? { title: correctTrigger.title, year: correctTrigger.year } : null}
  />
  <WrongFlash
    trigger={wrongTrigger ? { strikes: wrongTrigger.strikes } : null}
    shakeTargetRef={mainRef}
  />

  {/* Background poster collage — grows with each correct move */}
  <PosterBackground
    entries={game.moves.map((m) => ({
      movie: m.movie_title ?? m.movie,
      year: m.movie_year,
      posterUrl: m.poster_url,
      // Optional: pass a tint color per movie for the placeholder
    }))}
  />
</>

// ══════════════════════════════════════════════════════════════════
// STEP F — replace the objective card's hop progress with LinkProgress
// ══════════════════════════════════════════════════════════════════

// REMOVE the existing hop-line <div> map. REPLACE WITH:
<LinkProgress
  total={game.min_moves}
  completed={game.moves.length}
  forgeTrigger={forgeKey}
/>

// ══════════════════════════════════════════════════════════════════
// STEP G — current actor section with poster thumb
// ══════════════════════════════════════════════════════════════════

// REPLACE the existing "Now with" block:
const lastMove = game.moves[game.moves.length - 1];

<motion.div
  key={game.current_actor.name}
  initial={{ opacity: 0, x: -8 }}
  animate={{ opacity: 1, x: 0 }}
  className="mb-5 flex items-center gap-3"
>
  {/* Poster thumb — re-mounts (key) to retrigger slide-in each move */}
  {lastMove && (
    <ActorPosterThumb
      key={game.moves.length}
      movieTitle={lastMove.movie_title ?? lastMove.movie}
      posterUrl={lastMove.poster_url}
    />
  )}
  <div>
    <p className="text-white/25 text-[9px] tracking-widest uppercase mb-0.5">
      Current link
    </p>
    <p className="text-cinema-gold text-xl font-bold">
      {game.current_actor.name}
    </p>
  </div>
</motion.div>

// ══════════════════════════════════════════════════════════════════
// STEP H — replace the two inputs with CinematicInput
// ══════════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════════
// STEP I — replace the won state with WinScreen
// ══════════════════════════════════════════════════════════════════

{won ? (
  <WinScreen
    moves={game.moves}
    startActor={game.start_actor.name}
    endActor={game.end_actor.name}
    difficulty={game.difficulty}
    onPlayAgain={() => router.push("/")}
  />
) : lost ? (
  // ... keep existing lost state
  <></>
) : (
  // ... the form with CinematicInput above
  <></>
)}

// ══════════════════════════════════════════════════════════════════
// STEP J — remove old state and JSX no longer needed
// ══════════════════════════════════════════════════════════════════

// DELETE these state vars:
//   const [flashTitle, setFlashTitle] = useState<string | null>(null);
//   const [showStrikeFlash, setShowStrikeFlash] = useState(false);

// DELETE these AnimatePresence blocks:
//   {flashTitle && <motion.div ...>✓ {flashTitle}</motion.div>}
//   {showStrikeFlash && <motion.div ...>✕</motion.div>}

// ══════════════════════════════════════════════════════════════════
// OPTIONAL: add per-movie tint colors for richer placeholder posters
// ══════════════════════════════════════════════════════════════════

// In your Move interface, you can add an optional `tint` field,
// or derive a color from the movie ID for consistent coloring:

function movieTint(movieId?: number): string {
  const TINTS = [
    "#1a3a5c", "#3a1a2c", "#1a2a1a",
    "#2a1a3a", "#3a2a1a", "#1a2a3a",
  ];
  if (!movieId) return "#1a1a2a";
  return TINTS[movieId % TINTS.length];
}
