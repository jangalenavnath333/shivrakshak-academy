import { ACADEMY_FIGURES } from '@/content/landing'

/**
 * Verified facts, not marketing counts. Selection totals are absent on purpose —
 * see the note in src/content/landing.ts.
 */
export default function Figures() {
  return (
    <section className="sra-figures" aria-label="अकॅडमीविषयी">
      <div className="sra-wrap">
        <div className="sra-figures__grid">
          {ACADEMY_FIGURES.map(f => (
            <div key={f.label}>
              <b>{f.value}</b>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
