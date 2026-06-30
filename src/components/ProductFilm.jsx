export default function ProductFilm({ productFilmUrl }) {
  return (
    <section id="product-film" className="film-section reveal">
      <div className="film-copy">
        <p className="eyebrow">Product film</p>
        <h2>Watch the iPhone 18 Pro feature preview.</h2>
        <p>A responsive product video section for visitors who want the feature story before they register for updates.</p>
      </div>
      <div className="film-frame">
        <iframe
          src={productFilmUrl}
          title="iPhone 18 Pro feature preview video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </section>
  )
}
