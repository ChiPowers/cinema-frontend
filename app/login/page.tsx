"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="fixed top-0 left-0 right-0 h-14 bg-black z-20" />
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-black z-20" />
      <div className="fixed inset-0 pointer-events-none z-10 scanlines" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-center w-full max-w-sm"
      >
        <h1 className="text-6xl font-bold tracking-tighter mb-1 leading-none">CINEMA</h1>
        <h2 className="text-6xl font-bold tracking-tighter text-cinema-gold leading-none mb-6">
          GAME
        </h2>

        <p className="text-cinema-silver/50 text-xs leading-relaxed mb-10 max-w-xs mx-auto">
          Beta access required.
          <br />
          Sign in with your Google account to continue.
        </p>

        {error === "AccessDenied" && (
          <p className="text-red-400 text-xs mb-6 border border-red-400/30 px-4 py-2">
            Your account isn&apos;t on the beta list yet.
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full py-4 bg-cinema-gold text-black font-bold text-sm uppercase tracking-[0.3em] transition-opacity"
        >
          Sign in with Google
        </motion.button>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
