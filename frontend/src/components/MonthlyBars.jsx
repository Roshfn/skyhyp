export default function MonthlyBars({ months }) {
  if (!months || months.length === 0) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 4 }}>Monthly P&amp;L</h3>
        <p style={{ fontSize: 13, margin: 0 }}>Not enough data yet.</p>
      </div>
    )
  }

  const maxAbsPnl = Math.max(...months.map((m) => Math.abs(Number(m.totalPnl))), 1)

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 16 }}>Monthly P&amp;L</h3>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
        {months.map((m) => {
          const pnl = Number(m.totalPnl)
          const heightPct = (Math.abs(pnl) / maxAbsPnl) * 100
          const barColor = pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'

          return (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                <div
                  title={`${m.month}: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`}
                  style={{
                    width: '100%',
                    height: `${Math.max(heightPct, 3)}%`,
                    background: barColor,
                    borderRadius: '2px 2px 0 0'
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-ink-faint)', marginTop: 6, whiteSpace: 'nowrap' }}>
                {m.month.slice(5)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
