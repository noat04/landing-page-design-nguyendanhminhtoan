export default function Specs({ specs }) {
  return (
    <section id="specs" className="section-block specs-section reveal">
      <p className="eyebrow center">Built for performance</p>
      <h2>Key specifications.</h2>
      <div className="spec-grid">
        {specs.map(([label, value]) => (
          <article className="spec-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
