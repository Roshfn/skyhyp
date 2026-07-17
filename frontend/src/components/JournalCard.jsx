import { Link } from 'react-router-dom'
import PnlText from './PnlText'
import { labelize } from '../constants/enums'

export default function JournalCard({ journal }) {
  return (
    <Link
      to={`/journals/${journal.journalId}`}
      className="card"
      style={{
        display: 'block',
        padding: '16px 18px',
        marginBottom: 12,
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{journal.derivative}</span>
            <span className="badge badge-sky">{labelize(journal.setup)}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-faint)' }} className="mono">
            {journal.date}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--color-ink-faint)', marginBottom: 2 }}>
            P&amp;L
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            <PnlText value={journal.profitLoss} />
          </div>
        </div>
      </div>
    </Link>
  )
}
