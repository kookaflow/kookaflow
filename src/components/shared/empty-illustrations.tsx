import type { SVGProps } from "react";

/**
 * Inline empty-state illustrations. No external image assets —
 * everything is drawn with SVG primitives so it colour-shifts with
 * the surrounding theme.
 *
 * Colours are intentionally inline (not semantic tokens) because these
 * are bespoke illustrations and need a specific palette to read well in
 * both light and dark mode.
 */

export function KookaburraOnCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Calendar card */}
      <rect x="32" y="56" width="136" height="84" rx="10" fill="#1E2A6E" />
      <rect x="32" y="56" width="136" height="22" rx="10" fill="#F59E0B" />
      <rect x="32" y="74" width="136" height="4" fill="#F59E0B" />
      <circle cx="58" cy="52" r="4" fill="#94A3B8" />
      <rect x="56" y="44" width="4" height="14" rx="2" fill="#94A3B8" />
      <circle cx="142" cy="52" r="4" fill="#94A3B8" />
      <rect x="140" y="44" width="4" height="14" rx="2" fill="#94A3B8" />
      {/* dotted grid */}
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 5 }).map((__, c) => (
          <circle
            key={`${r}-${c}`}
            cx={52 + c * 24}
            cy={92 + r * 12}
            r={1.6}
            fill="#FFFFFF"
            fillOpacity={0.25}
          />
        )),
      )}
      {/* Branch */}
      <path
        d="M20 130 Q 80 118 180 134"
        stroke="#6B4226"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Kookaburra */}
      <g transform="translate(86 84)">
        {/* body */}
        <ellipse cx="20" cy="22" rx="22" ry="18" fill="#E8E4D8" />
        {/* wing */}
        <path d="M20 20 Q 36 22 40 32 Q 28 36 16 30 Z" fill="#5B6B8F" />
        {/* head */}
        <circle cx="38" cy="14" r="12" fill="#F5F1E6" />
        {/* head stripe */}
        <path d="M30 12 Q 38 8 46 12 L 46 16 Q 38 14 30 16 Z" fill="#6B4226" />
        {/* eye */}
        <circle cx="42" cy="13" r="1.8" fill="#0B1220" />
        {/* beak */}
        <path d="M48 14 L 58 16 L 48 18 Z" fill="#F59E0B" />
        {/* tail */}
        <path d="M0 24 L -8 20 L -6 28 Z" fill="#5B6B8F" />
        {/* feet */}
        <path
          d="M16 40 L 16 46 M 24 40 L 24 46"
          stroke="#6B4226"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function BalanceScale(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* base */}
      <rect x="84" y="128" width="32" height="8" rx="2" fill="#1E2A6E" />
      <rect x="96" y="48" width="8" height="84" rx="2" fill="#1E2A6E" />
      {/* beam */}
      <rect
        x="40"
        y="46"
        width="120"
        height="6"
        rx="3"
        fill="#1E2A6E"
      />
      {/* ropes */}
      <path d="M52 52 L 40 86" stroke="#94A3B8" strokeWidth="2" />
      <path d="M68 52 L 80 86" stroke="#94A3B8" strokeWidth="2" />
      <path d="M132 52 L 120 86" stroke="#94A3B8" strokeWidth="2" />
      <path d="M148 52 L 160 86" stroke="#94A3B8" strokeWidth="2" />
      {/* left pan */}
      <path d="M36 86 H 84 L 76 96 H 44 Z" fill="#F59E0B" />
      {/* right pan */}
      <path d="M116 86 H 164 L 156 96 H 124 Z" fill="#10B981" />
      {/* pivot */}
      <circle cx="100" cy="48" r="6" fill="#F59E0B" />
    </svg>
  );
}

export function BriefcaseEmpty(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* handle */}
      <rect
        x="78"
        y="36"
        width="44"
        height="20"
        rx="6"
        stroke="#1E2A6E"
        strokeWidth="4"
      />
      {/* body */}
      <rect x="36" y="56" width="128" height="80" rx="10" fill="#1E2A6E" />
      <rect
        x="36"
        y="84"
        width="128"
        height="6"
        fill="#F59E0B"
        fillOpacity={0.8}
      />
      {/* latch */}
      <rect x="90" y="84" width="20" height="14" rx="2" fill="#F59E0B" />
      <circle cx="100" cy="91" r="2" fill="#1E2A6E" />
    </svg>
  );
}