interface PetalProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Petal({ size = 20, className = "", style }: PetalProps) {
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
  { left: "4%", delay: "0s", duration: "9s", size: 20 },
  { left: "14%", delay: "4s", duration: "11s", size: 24 },
  { left: "24%", delay: "1.5s", duration: "10s", size: 18 },
  { left: "35%", delay: "6s", duration: "12s", size: 22 },
  { left: "46%", delay: "2.5s", duration: "9s", size: 26 },
  { left: "57%", delay: "7s", duration: "13s", size: 19 },
  { left: "67%", delay: "3s", duration: "10s", size: 23 },
  { left: "77%", delay: "5.5s", duration: "12s", size: 20 },
  { left: "88%", delay: "1s", duration: "11s", size: 25 },
  { left: "96%", delay: "8s", duration: "14s", size: 18 },
];

export function PetalDrift() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {DRIFT.map((p) => (
        <Petal
          key={p.left}
          size={p.size}
          className="petal-drift absolute -top-6 opacity-0"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

