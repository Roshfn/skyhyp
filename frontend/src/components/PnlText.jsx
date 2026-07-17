export default function PnlText({ value }) {
  if (value === null || value === undefined) {
    return <span className="mono pnl-neutral">—</span>
  }

  const num = Number(value)
  const cls = num > 0 ? 'pnl-positive' : num < 0 ? 'pnl-negative' : 'pnl-neutral'
  const sign = num > 0 ? '+' : ''

  return (
    <span className={`mono ${cls}`}>
      {sign}
      {num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}
