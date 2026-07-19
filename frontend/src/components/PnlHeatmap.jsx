import { useMemo, useState } from 'react'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CELL_SIZE = 12
const CELL_GAP = 3

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

/**
 * Builds a GitHub-style grid: columns are weeks (Sun-Sat), starting from the
 * Sunday on/before Jan 1 and ending the Saturday on/after Dec 31, so every
 * week column is a full 7 cells even at the year's edges.
 */
function buildYearGrid(year) {
  const jan1 = new Date(Date.UTC(year, 0, 1))
  const dec31 = new Date(Date.UTC(year, 11, 31))

  const gridStart = new Date(jan1)
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay())

  const gridEnd = new Date(dec31)
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()))

  const weeks = []
  let cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

/**
 * Buckets each day into one of: blank (no entries), zero (entries netting to
 * exactly 0), light/bright green, light/bright red. Bright vs. light is
 * decided by the median magnitude of that day's own sign group, the same
 * idea GitHub uses for commit-count quartiles - so the coloring stays
 * meaningful whether trades are worth $10 or $10,000.
 */
function computeBuckets(dailyData) {
  const byDate = new Map()
  const gains = []
  const losses = []

  for (const entry of dailyData) {
    byDate.set(entry.date, entry)
    const pnl = Number(entry.totalPnl)
    if (pnl > 0) gains.push(pnl)
    else if (pnl < 0) losses.push(Math.abs(pnl))
  }

  const median = (arr) => {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  const gainMedian = median(gains)
  const lossMedian = median(losses)

  return {
    byDate,
    classify(dateKey) {
      const entry = byDate.get(dateKey)
      if (!entry) return 'blank'

      const pnl = Number(entry.totalPnl)
      if (pnl === 0) return 'zero'
      if (pnl > 0) return pnl >= gainMedian ? 'green-bright' : 'green-light'
      return Math.abs(pnl) >= lossMedian ? 'red-bright' : 'red-light'
    }
  }
}

const BUCKET_COLORS = {
  blank: 'var(--color-surface-muted)',
  zero: '#cbd5e1',
  'green-light': '#86efac',
  'green-bright': '#16a34a',
  'red-light': '#fca5a5',
  'red-bright': '#dc2626'
}

function Cell({ date, bucket, entry }) {
  const [hovered, setHovered] = useState(false)
  const dateKey = toDateKey(date)
  const label = entry
    ? `${dateKey} · ${Number(entry.totalPnl) >= 0 ? '+' : ''}${Number(entry.totalPnl).toFixed(2)} · ${entry.tradeCount} trade${entry.tradeCount === 1 ? '' : 's'}`
    : `${dateKey} · no entries`

  return (
    <div
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 2,
        background: BUCKET_COLORS[bucket],
        border: bucket === 'blank' ? '1px solid var(--color-border)' : '1px solid transparent',
        outline: hovered ? '1px solid var(--color-ink)' : 'none',
        outlineOffset: 1
      }}
    />
  )
}

export default function PnlHeatmap({ data }) {
  const year = new Date().getUTCFullYear()
  const weeks = useMemo(() => buildYearGrid(year), [year])
  const { byDate, classify } = useMemo(() => computeBuckets(data ?? []), [data])

  // Month labels: mark the week column where a new month first appears.
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, weekIndex) => {
      const firstOfWeek = week[0]
      const month = firstOfWeek.getUTCMonth()
      if (month !== lastMonth && firstOfWeek.getUTCFullYear() === year) {
        labels.push({ weekIndex, label: MONTH_LABELS[month] })
        lastMonth = month
      }
    })
    return labels
  }, [weeks, year])

  return (
    <div className="card" style={{ padding: 20, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3>Daily P&amp;L — {year}</h3>
        <Legend />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-block' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${weeks.length}, ${CELL_SIZE}px)`,
              gap: CELL_GAP,
              marginBottom: 4,
              marginLeft: 0,
              height: 14,
              position: 'relative'
            }}
          >
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={weekIndex}
                style={{
                  gridColumnStart: weekIndex + 1,
                  fontSize: 11,
                  color: 'var(--color-ink-faint)',
                  whiteSpace: 'nowrap'
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${weeks.length}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
              gridAutoFlow: 'column',
              gap: CELL_GAP
            }}
          >
            {weeks.map((week, weekIndex) =>
              week.map((date, dayIndex) => {
                const dateKey = toDateKey(date)
                const inYear = date.getUTCFullYear() === year
                return (
                  <div key={`${weekIndex}-${dayIndex}`} style={{ visibility: inYear ? 'visible' : 'hidden' }}>
                    {inYear && <Cell date={date} bucket={classify(dateKey)} entry={byDate.get(dateKey)} />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Legend() {
  const items = [
    { bucket: 'red-bright', label: 'Big loss' },
    { bucket: 'red-light', label: 'Loss' },
    { bucket: 'zero', label: 'Flat' },
    { bucket: 'green-light', label: 'Gain' },
    { bucket: 'green-bright', label: 'Big gain' }
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--color-ink-faint)' }}>
      {items.map(({ bucket, label }) => (
        <span key={bucket} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: BUCKET_COLORS[bucket],
              display: 'inline-block'
            }}
          />
          {label}
        </span>
      ))}
    </div>
  )
}
