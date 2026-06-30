export default function Features({ features }) {
  return (
    <section id="features" className="section-block reveal">
      <p className="eyebrow center">Next-level highlights</p>
      <h2>Powerful features. Pro experience.</h2>
      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
