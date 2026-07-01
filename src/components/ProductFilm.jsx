import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export default function ProductFilm({ productFilmId }) {
  return (
    <section id="product-film" className="film-section reveal">
      <div className="film-copy">
        <p className="eyebrow">Product film</p>
        <h2>Watch the iPhone 18 Pro feature preview.</h2>
        <p>A responsive product video section for visitors who want the feature story before they register for updates.</p>
      </div>
      <div className="film-frame">
        <LiteYouTubeEmbed
          id={productFilmId}
          title="iPhone 18 Pro feature preview video"
          lazyLoad
          poster="hqdefault"
          webp
        />
      </div>
    </section>
  )
}
