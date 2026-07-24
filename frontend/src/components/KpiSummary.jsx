import { useMemo, useState } from 'react'
import StatTile from './StatTile'
import { computeKpis, getWeekRange, getMonthRange, filterJournalsInRange } from '../utils/kpi'

export default function KpiSummary({ journals }) {
  const [period, setPeriod] = useState('monthly')

  const scoped = useMemo(() => {
    const { start, end } = period === 'weekly' ? getWeekRange() : getMonthRange()
    return filterJournalsInRange(journals, start, end)
  }, [journals, period])

  const kpis = useMemo(() => computeKpis(scoped), [scoped])
  const pnlTone = kpis.totalPnl > 0 ? 'positive' : kpis.totalPnl < 0 ? 'negative' : 'neutral'

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <div style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: period === p ? 'var(--color-sky)' : '#ffffff',
                color: period === p ? '#ffffff' : 'var(--color-ink-soft)',
                textTransform: 'capitalize'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <StatTile
          label="Total P&L"
          value={`${kpis.totalPnl >= 0 ? '+' : ''}${kpis.totalPnl.toFixed(2)}`}
          tone={pnlTone}
          hint={`${kpis.closedTrades} closed trades`}
        />
        <StatTile
          label="Win rate"
          value={`${kpis.winRatePercent.toFixed(0)}%`}
          hint={`${kpis.wins}W · ${kpis.losses}L · ${kpis.breakeven}BE`}
        />
        <StatTile
          label="Profit factor"
          value={kpis.profitFactor === null ? '—' : kpis.profitFactor.toFixed(2)}
          hint="Gross profit ÷ gross loss"
        />
      </div>
    </div>
  )
}
