// शिवरक्षक करियर अकॅडमी — Official Logo
// Army/Police themed shield emblem

export default function Logo({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'block' }}>
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="55%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2038" />
          <stop offset="100%" stopColor="#050d18" />
        </linearGradient>
        <linearGradient id="starGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Outer shield */}
      <path
        d="M50 4 L88 17 V47 C88 70 71 88 50 96 C29 88 12 70 12 47 V17 Z"
        fill="url(#shieldGrad)"
      />
      {/* Inner shield */}
      <path
        d="M50 12 L81 22.5 V47 C81 66 67 81.5 50 88.5 C33 81.5 19 66 19 47 V22.5 Z"
        fill="url(#innerGrad)"
      />

      {/* Star (Police/Army rank insignia) */}
      <path
        d="M50 24 L54.2 36.5 L67.4 36.5 L56.7 44.3 L60.8 56.8 L50 49 L39.2 56.8 L43.3 44.3 L32.6 36.5 L45.8 36.5 Z"
        fill="url(#starGrad)"
      />

      {/* Crossed rifles / batons */}
      <g stroke="#f97316" strokeWidth="3.2" strokeLinecap="round" opacity="0.95">
        <line x1="34" y1="76" x2="66" y2="60" />
        <line x1="66" y1="76" x2="34" y2="60" />
      </g>

      {/* Rank chevrons */}
      <g fill="#fbbf24" opacity="0.85">
        <path d="M50 62 L57 68 L54.6 68 L50 64.5 L45.4 68 L43 68 Z" />
      </g>

      {/* Base bar */}
      <rect x="35" y="81" width="30" height="3" rx="1.5" fill="#f97316" opacity="0.6" />
    </svg>
  )
}
