/**
 * Computes the same 3 headline numbers the backend's SummaryStats does,
 * but scoped to whatever subset of journals you pass in (this week, this
 * month, etc). Kept intentionally tiny and dependency-free - if this grows
 * past these 3 numbers, move it server-side instead of expanding this file.
 */
export function computeKpis(journals) {
  const closed = journals.filter((j) => j.profitLoss !== null && j.profitLoss !== undefined)

  const wins = closed.filter((j) => Number(j.profitLoss) > 0).length
  const losses = closed.filter((j) => Number(j.profitLoss) < 0).length
  const breakeven = closed.length - wins - losses

  const totalPnl = closed.reduce((sum, j) => sum + Number(j.profitLoss), 0)
  const grossProfit = closed
    .filter((j) => Number(j.profitLoss) > 0)
    .reduce((sum, j) => sum + Number(j.profitLoss), 0)
  const grossLoss = Math.abs(
    closed.filter((j) => Number(j.profitLoss) < 0).reduce((sum, j) => sum + Number(j.profitLoss), 0)
  )

  const winRatePercent = closed.length === 0 ? 0 : (wins / closed.length) * 100
  const profitFactor = grossLoss === 0 ? null : grossProfit / grossLoss

  return {
    closedTrades: closed.length,
    wins,
    losses,
    breakeven,
    totalPnl,
    winRatePercent,
    profitFactor
  }
}

/** Monday-Sunday range containing `date` (defaults to today). */
export function getWeekRange(date = new Date()) {
  const day = date.getDay() // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(start.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function filterJournalsInRange(journals, start, end) {
  return journals.filter((j) => {
    const d = new Date(j.date)
    return d >= start && d <= end
  })
}
