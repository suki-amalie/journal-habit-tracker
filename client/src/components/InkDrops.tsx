// InkDrops.tsx

interface InkDropProps {
  color: string;
  size?: number | string;
  variant?: 1 | 2 | 3;
  className?: string;
}

const paths = {
  1: {
    outer:
      "M50 13 C63 16, 78 27, 82 43 C86 58, 78 76, 62 83 C46 90, 27 84, 18 69 C9 54, 14 36, 28 24 C37 16, 44 11, 50 13 Z",
    inner:
      "M48 22 C60 25, 70 34, 72 46 C74 58, 67 69, 55 74 C43 79, 30 73, 25 62 C20 51, 25 38, 35 29 C40 25, 44 21, 48 22 Z",
  },

  2: {
    outer:
      "M47 14 C63 12, 80 23, 85 39 C90 55, 81 72, 67 80 C52 89, 32 84, 21 72 C10 60, 12 42, 22 29 C29 20, 39 15, 47 14 Z",
    inner:
      "M46 23 C58 22, 71 30, 75 42 C79 54, 72 67, 61 72 C49 78, 35 73, 28 63 C21 53, 25 39, 35 30 C39 26, 43 24, 46 23 Z",
  },

  3: {
    outer:
      "M53 13 C68 17, 80 29, 82 44 C84 59, 76 74, 62 81 C47 89, 29 83, 20 70 C11 57, 15 39, 26 27 C36 17, 46 11, 53 13 Z",
    inner:
      "M51 23 C62 26, 71 35, 73 46 C75 57, 68 68, 57 73 C45 78, 33 73, 27 63 C21 53, 25 40, 35 30 C41 24, 47 21, 51 23 Z",
  },
} as const;

export function InkDrop({
  color,
  size = 16,
  variant = 1,
  className = "",
}: InkDropProps) {
  const selectedPath = paths[variant];

  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: size, height: size, color }}
      className={`shrink-0 overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`watercolor-${variant}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves="2"
            seed={variant}
            result="noise"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Soft pigment underneath */}
      <path
        d={selectedPath.outer}
        fill="currentColor"
        opacity="0.18"
        filter={`url(#watercolor-${variant})`}
        transform="scale(1.04) translate(-2 -2)"
      />

      {/* Main pigment */}
      <path
        d={selectedPath.outer}
        fill="currentColor"
        opacity="0.68"
        filter={`url(#watercolor-${variant})`}
      />

      {/* Uneven pigment concentration */}
      <path
        d={selectedPath.inner}
        fill="currentColor"
        opacity="0.18"
      />

      {/* Small translucent pigment pool */}
      <ellipse
        cx="58"
        cy="57"
        rx="14"
        ry="10"
        fill="currentColor"
        opacity="0.10"
      />
    </svg>
  );
}

interface InkDropGroupProps {
  size?: number | string;
  gap?: string;
  className?: string;
}

export function InkDropGroup({
  size = 16,
  gap = "gap-1",
  className = "",
}: InkDropGroupProps) {
  const brandColors = [
    "#6B8FC4", // reflection
    "#4F8A47", // action
    "#D98B9B", // encouragement
  ];

  return (
    <div
      className={`flex items-center ${gap} ${className}`}
      aria-hidden="true"
    >
      {brandColors.map((color, index) => (
        <InkDrop
          key={color}
          color={color}
          size={size}
          variant={(index + 1) as 1 | 2 | 3}
        />
      ))}
    </div>
  );
}

export function GreenInkDrop({
  size = 16,
  className = "",
}: {
  size?: number | string;
  className?: string;
}) {
  return (
    <InkDrop
      color="#4F8A47"
      variant={2}
      size={size}
      className={className}
    />
  );
}

export function PinkInkDrop({
  size = 16,
  className = "",
}: {
  size?: number | string;
  className?: string;
}) {
  return (
    <InkDrop
      color="#D98B9B"
      variant={3}
      size={size}
      className={className}
    />
  );
}

export function BlueInkDrop({
  size = 16,
  className = "",
}: {
  size?: number | string;
  className?: string;
}) {
  return (
    <InkDrop
      color="#6B8FC4"
      variant={1}
      size={size}
      className={className}
    />
  );
}

// InkDrops.tsx

interface InkDropProps {
  color: string;
  size?: number | string;
  variant?: 1 | 2 | 3;
  className?: string;
  animate?: boolean;
}

interface InkBloomProps {
  active: boolean;
}

export function InkBloom({ active }: InkBloomProps) {
  if (!active) return null;

  return (
    <span
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span className="ink-bloom-ring" />
    </span>
  );
}