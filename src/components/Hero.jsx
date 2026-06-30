export default function Hero({ bannerImage, onTrackClick }) {
  return (
    <section id="top" className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Introducing</p>
        <h1 className="hero-title">
          iPhone 18 Pro
          <span>Pro. Beyond.</span>
        </h1>
        <p className="hero-text">
          Apple-level innovation reimagined.
          <br />
          Engineered for those who demand more.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#signup" onClick={() => onTrackClick('pre-order now')}>
            Pre-order now
          </a>
          <a className="ghost-button film-button" href="#product-film" onClick={() => onTrackClick('watch the film')}>
            Watch the film
            <span aria-hidden="true">PLAY</span>
          </a>
        </div>
        <div className="colors" aria-label="Available colors">
          <span>Available in</span>
          <i className="rose" />
          <i className="deep-purple" />
          <i className="desert-gold" />
        </div>
      </div>

      <div className="hero-visual" aria-label="iPhone 18 Pro product banner">
        <div className="hero-banner-wrap">
          <img
            className="hero-banner"
            src={bannerImage}
            alt="iPhone 18 Pro landing page product banner"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="hero-glow" />
      </div>
    </section>
  )
}
