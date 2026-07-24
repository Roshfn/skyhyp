import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function cellTone(totalPnl) {
  if (totalPnl > 0) return { bg: 'var(--color-profit-bg)', fg: 'var(--color-profit)' }
  if (totalPnl < 0) return { bg: 'var(--color-loss-bg)', fg: 'var(--color-loss)' }
  return { bg: 'var(--color-surface-muted)', fg: 'var(--color-ink-soft)' }
}

/**
 * `journals` is the full list for the visible month only (already filtered by
 * the parent) - each day's cell total is computed here from that list.
 */
export default function MonthCalendar({ journals, month, onMonthChange }) {
  const navigate = useNavigate()
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  const dailyTotals = useMemo(() => {
    const map = new Map()
    for (const j of journals) {
      if (j.profitLoss === null || j.profitLoss === undefined) continue
      const existing = map.get(j.date) || { totalPnl: 0, tradeCount: 0 }
      existing.totalPnl += Number(j.profitLoss)
      existing.tradeCount += 1
      map.set(j.date, existing)
    }
    return map
  }, [journals])

  const monthTotal = useMemo(
    () => [...dailyTotals.values()].reduce((sum, d) => sum + d.totalPnl, 0),
    [dailyTotals]
  )

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(year, monthIndex, 1)
    const startOffset = (firstOfMonth.getDay() + 6) % 7 // Monday = 0
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(day)
    while (cells.length % 7 !== 0) cells.push(null)

    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [year, monthIndex])

  function goToPrevMonth() {
    onMonthChange(new Date(year, monthIndex - 1, 1))
  }
  function goToNextMonth() {
    onMonthChange(new Date(year, monthIndex + 1, 1))
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={goToPrevMonth} aria-label="Previous month">
            ‹
          </button>
          <h3 style={{ margin: 0, minWidth: 160, textAlign: 'center' }}>
            {MONTH_LABELS[monthIndex]} {year}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={goToNextMonth} aria-label="Next month">
            ›
          </button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>
          Month P&amp;L:{' '}
          <span className="mono" style={{ color: monthTotal >= 0 ? 'var(--color-profit)' : 'var(--color-loss)', fontWeight: 600 }}>
            {monthTotal >= 0 ? '+' : ''}
            {monthTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-faint)', textAlign: 'center', paddingBottom: 4 }}>
            {label}
          </div>
        ))}

        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            if (day === null) {
              return <div key={`${weekIndex}-${dayIndex}`} />
            }

            const dateKey = toDateKey(year, monthIndex, day)
            const entry = dailyTotals.get(dateKey)
            const tone = entry ? cellTone(entry.totalPnl) : { bg: 'var(--color-surface)', fg: 'var(--color-ink-faint)' }
            const isToday = dateKey === toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

            return (
              <div
                key={dateKey}
                onClick={() => navigate(`/review?date=${dateKey}`)}
                style={{
                  minHeight: 64,
                  borderRadius: 6,
                  padding: '6px 8px',
                  background: tone.bg,
                  border: isToday ? '1.5px solid var(--color-sky)' : '1px solid var(--color-border)',
                  cursor: 'pointer'
                }}
                title={entry ? `${dateKey}: ${entry.totalPnl >= 0 ? '+' : ''}${entry.totalPnl.toFixed(2)} · ${entry.tradeCount} trade${entry.tradeCount === 1 ? '' : 's'}` : `${dateKey}: no trades`}
              >
                <div style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>{day}</div>
                {entry && (
                  <div style={{ marginTop: 4 }}>
                    <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: tone.fg }}>
                      {entry.totalPnl >= 0 ? '+' : ''}
                      {entry.totalPnl.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--color-ink-faint)' }}>
                      {entry.tradeCount} trade{entry.tradeCount === 1 ? '' : 's'}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
