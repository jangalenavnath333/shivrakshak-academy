/**
 * Two small dependency-free SVG charts. Both are pure server-renderable markup —
 * no charting library is added to the bundle, and both degrade to an empty state
 * when the underlying tables have no rows yet.
 */

export function TrendChart({ points, height = 190 }: { points: { label: string; value: number }[]; height?: number }) {
  if (points.length < 2) return null
  const w = 620
  const padX = 34, padY = 16
  const max = Math.max(...points.map(p => p.value), 4)
  const stepX = (w - padX * 2) / (points.length - 1)
  const y = (v: number) => padY + (height - padY * 2) * (1 - v / max)
  const coords = points.map((p, i) => [padX + i * stepX, y(p.value)] as const)
  const line = coords.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ')
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height - padY} L${padX},${height - padY} Z`
  const ticks = [0, Math.round(max / 2), max]

  return (
    <svg viewBox={`0 0 ${w} ${height + 22}`} width="100%" height={height + 22} role="img"
      aria-label={`विद्यार्थी नोंदणी ट्रेंड: ${points.map(p => `${p.label} ${p.value}`).join(', ')}`}>
      <defs>
        <linearGradient id="admTrend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c2029" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7c2029" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map(t => (
        <g key={t}>
          <line x1={padX} x2={w - padX} y1={y(t)} y2={y(t)} stroke="#eef0eb" strokeWidth="1" />
          <text x={padX - 8} y={y(t) + 3.5} textAnchor="end" fontSize="9.5" fill="#94a3b8">{t}</text>
        </g>
      ))}
      <path d={area} fill="url(#admTrend)" />
      <path d={line} fill="none" stroke="#7c2029" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map(([x, yy], i) => <circle key={i} cx={x} cy={yy} r="3.1" fill="#fff" stroke="#7c2029" strokeWidth="2" />)}
      {points.map((p, i) => (
        <text key={p.label} x={padX + i * stepX} y={height + 12} textAnchor="middle" fontSize="9.5" fill="#94a3b8">{p.label}</text>
      ))}
    </svg>
  )
}

export function DonutChart({ slices, total, caption }: {
  slices: { label: string; value: number; color: string }[]
  total: number
  caption: string
}) {
  const size = 168, stroke = 22, r = (size - stroke) / 2, c = 2 * Math.PI * r
  let offset = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
        <svg width={size} height={size} role="img" aria-label={`${caption}: ${slices.map(s => `${s.label} ${s.value}`).join(', ')}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0eb" strokeWidth={stroke} />
            {total > 0 && slices.filter(s => s.value > 0).map(s => {
              const len = (s.value / total) * c
              const el = (
                <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
                  strokeWidth={stroke} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
              )
              offset += len
              return el
            })}
          </g>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#401d20', lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>एकूण</div>
        </div>
      </div>
      <div className="adm-legend" style={{ flex: 1, minWidth: 150 }}>
        {slices.map(s => (
          <div key={s.label}>
            <i style={{ background: s.color }} />
            {s.label}
            <b>{total > 0 ? Math.round((s.value / total) * 100) : 0}% ({s.value})</b>
          </div>
        ))}
      </div>
    </div>
  )
}
