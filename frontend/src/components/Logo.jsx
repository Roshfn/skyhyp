export default function Logo({ size = 22 }) {
  return (
    <span
      style={{
        fontFamily: '"Source Serif 4", Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.01em',
        userSelect: 'none'
      }}
      aria-label="skyhyp"
    >
      <span style={{ color: 'var(--color-sky)' }}>sky</span>
      <span style={{ color: 'var(--color-ink)' }}>hyp</span>
    </span>
  )
}
