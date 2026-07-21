import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import StatTile from '../components/StatTile'
import BreakdownList from '../components/BreakdownList'
import MonthlyBars from '../components/MonthlyBars'
import { api, ApiError } from '../api/client'

export default function PerformancePage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    api
      .getDashboard()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load performance data.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <TopBar />
      <main className="container" style={{ padding: '32px 24px 64px' }}>
        <h1 style={{ marginBottom: 4 }}>Performance</h1>
        <p style={{ marginBottom: 24 }}>Insights drawn from your full trading history.</p>

        {error && <div className="alert alert-error">{error}</div>}

        {!data && !error && <p>Loading…</p>}

        {data && data.summary.closedTrades === 0 && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontStyle: 'italic' }}>No closed trades yet</h3>
            <p>Log a P&amp;L on a few entries and your performance breakdown will show up here.</p>
          </div>
        )}

        {data && data.summary.closedTrades > 0 && (
          <>
            <Insights insights={data.insights} />
            <SummaryGrid summary={data.summary} />
            <MonthlyBars months={data.monthlyPnl} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginTop: 20
              }}
            >
              <BreakdownList title="By setup" stats={data.bySetup} />
              <BreakdownList title="By risk : reward" stats={data.byRiskReward} />
              <BreakdownList title="Followed my plan?" stats={data.byDidFollowPlan} />
              <BreakdownList title="Emotion before trade" stats={data.byEmotionBeforeTrade} />
              <BreakdownList title="Emotion during trade" stats={data.byEmotionDuringTrade} />
              <BreakdownList title="By day of week" stats={data.byDayOfWeek} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Insights({ insights }) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="card" style={{ padding: 20, marginBottom: 20, background: 'var(--color-sky-soft)', border: '1px solid #bae6fd' }}>
      <h3 style={{ marginBottom: 10 }}>Highlights</h3>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {insights.map((line, i) => (
          <li key={i} style={{ marginBottom: 6, fontSize: 14, color: 'var(--color-ink)' }}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SummaryGrid({ summary }) {
  const pnlTone = Number(summary.totalPnl) > 0 ? 'positive' : Number(summary.totalPnl) < 0 ? 'negative' : 'neutral'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 20
      }}
    >
      <StatTile
        label="Total P&L"
        value={`${Number(summary.totalPnl) >= 0 ? '+' : ''}${Number(summary.totalPnl).toFixed(2)}`}
        tone={pnlTone}
        hint={`${summary.closedTrades} closed trades`}
      />
      <StatTile
        label="Win rate"
        value={`${Number(summary.winRatePercent).toFixed(0)}%`}
        hint={`${summary.wins}W · ${summary.losses}L · ${summary.breakeven}BE`}
      />
      <StatTile
        label="Profit factor"
        value={summary.profitFactor === null ? '—' : Number(summary.profitFactor).toFixed(2)}
        hint="Gross profit ÷ gross loss"
      />
      <StatTile
        label="Avg P&L / trade"
        value={`${Number(summary.avgPnlPerTrade) >= 0 ? '+' : ''}${Number(summary.avgPnlPerTrade).toFixed(2)}`}
      />
      <StatTile label="Avg win" value={`+${Number(summary.avgWin).toFixed(2)}`} tone="positive" />
      <StatTile label="Avg loss" value={`-${Number(summary.avgLoss).toFixed(2)}`} tone="negative" />
      <StatTile label="Largest win" value={`+${Number(summary.largestWin).toFixed(2)}`} tone="positive" />
      <StatTile label="Largest loss" value={Number(summary.largestLoss).toFixed(2)} tone="negative" />
    </div>
  )
}
