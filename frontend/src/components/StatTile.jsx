export default function StatTile({ label, value, tone = 'neutral', hint }) {
  const toneColor =
    tone === 'positive'
      ? 'var(--color-profit)'
      : tone === 'negative'
      ? 'var(--color-loss)'
      : 'var(--color-ink)'

  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 6 }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: toneColor }}>
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 4 }}>{hint}</div>
      )}
    </div>
  )
}
