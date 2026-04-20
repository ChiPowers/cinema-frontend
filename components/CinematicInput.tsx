"use client";

import React, { useRef } from "react";

interface CinematicInputProps {
  label: string;
  takeLabel?: string; // e.g. "TAKE 1"
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function CinematicInput({
  label,
  takeLabel,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  inputRef,
}: CinematicInputProps) {
  return (
    <div>
      <label className="block text-[9px] text-white/25 tracking-[0.25em] uppercase mb-1.5">
        {label}
      </label>

      {/* Viewfinder wrapper */}
      <div className="cinematic-wrap relative">
        {/* Other two corners */}
        <span className="cinematic-corners" />

        {/* Scanning line */}
        <div className="cinematic-scan" />

        {/* TAKE badge */}
        {takeLabel && (
          <span
            className="absolute -top-[9px] right-2.5 z-10 px-1.5 text-[8px] tracking-[0.15em]
                       uppercase bg-cinema-black text-cinema-gold/40 pointer-events-none
                       transition-colors duration-200
                       [.cinematic-wrap:focus-within_&]:text-cinema-gold"
          >
            {takeLabel}
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          spellCheck={false}
          className="
            w-full relative z-[1]
            bg-[rgba(10,10,10,0.9)] border border-white/[0.08]
            px-4 py-3.5
            font-mono text-[13px] text-white
            placeholder:text-white/15
            caret-cinema-gold
            outline-none
            transition-[border-color,background,box-shadow] duration-200
            focus:border-cinema-gold/40
            focus:bg-[rgba(16,14,4,0.95)]
            focus:shadow-[0_0_0_1px_rgba(245,197,24,0.08),inset_0_0_20px_rgba(245,197,24,0.03)]
            disabled:opacity-40
          "
        />
      </div>
    </div>
  );
}
