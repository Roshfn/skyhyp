import { labelize } from '../constants/enums'

export default function BreakdownList({ title, stats }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 13, margin: 0 }}>Not enough data yet.</p>
      </div>
    )
  }

  const maxAbsPnl = Math.max(...stats.map((s) => Math.abs(Number(s.totalPnl))), 1)

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 14 }}>{title}</h3>

      {stats.map((stat) => {
        const pnl = Number(stat.totalPnl)
        const widthPct = (Math.abs(pnl) / maxAbsPnl) * 100
        const barColor = pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'

        return (
          <div key={stat.label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{labelize(stat.label)}</span>
              <span className="mono" style={{ color: barColor }}>
                {pnl >= 0 ? '+' : ''}
                {pnl.toFixed(2)}
              </span>
            </div>
            <div style={{ background: 'var(--color-surface-muted)', borderRadius: 3, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${widthPct}%`, height: '100%', background: barColor }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-faint)', marginTop: 3 }}>
              {stat.tradeCount} trade{stat.tradeCount === 1 ? '' : 's'} · {Number(stat.winRatePercent).toFixed(0)}% win rate · avg{' '}
              {Number(stat.avgPnl) >= 0 ? '+' : ''}
              {Number(stat.avgPnl).toFixed(2)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
