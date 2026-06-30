export default function Story({ storyCards }) {
  return (
    <section id="story" className="story-section reveal">
      <div className="story-heading">
        <p className="eyebrow center">Designed to inspire</p>
        <h2>Crafted to stand out.</h2>
      </div>
      <div className="story-grid">
        {storyCards.map((card, index) => (
          <article className={`story-card story-card-${index + 1}`} key={card.title}>
            <div className="story-shine" />
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
      <div className="slider-dots" aria-label="Story progress">
        <span className="active" />
        <span />
        <span />
      </div>
    </section>
  )
}
