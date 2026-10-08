interface PetalProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Petal({ size = 14, className = "", style }: PetalProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      style={style}
    >
      <path
        d="M12 2 C15 5 19 8 18 13 C17 18 13 22 12 22 C11 22 7 18 6 13 C5 8 9 5 12 2 Z M12 2 L12 8 L10.5 5 Z"
        fill="#F2B5C8"
        fillRule="evenodd"
      />
    </svg>
  );
}

const DRIFT = [
  { left: "8%", delay: "0s", duration: "9s", size: 12 },
  { left: "30%", delay: "3s", duration: "11s", size: 10 },
  { left: "55%", delay: "6s", duration: "10s", size: 14 },
  { left: "80%", delay: "1.5s", duration: "12s", size: 11 },
];

export function PetalDrift() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {DRIFT.map((p) => (
        <Petal
          key={p.left}
          size={p.size}
          className="petal-drift absolute -top-4 opacity-0"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
    </div>
  );
}