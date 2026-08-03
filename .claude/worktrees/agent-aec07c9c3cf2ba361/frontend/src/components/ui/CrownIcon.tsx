export function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.5 8.5L7 12l3.2-6L12 9.5 13.8 6 17 12l3.5-3.5-1.3 9.4a1 1 0 01-1 .85H5.8a1 1 0 01-1-.85L3.5 8.5z"
        fill="currentColor"
      />
      <circle cx="3.5" cy="7.2" r="1.4" fill="currentColor" />
      <circle cx="12" cy="5.4" r="1.4" fill="currentColor" />
      <circle cx="20.5" cy="7.2" r="1.4" fill="currentColor" />
    </svg>
  );
}
