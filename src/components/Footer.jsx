export default function Footer({ year }) {
  return (
    <footer className="site-footer">
      <div>
        <a className="brand" href="#top" aria-label="Techgear home">
          <span className="brand-mark">18</span>
          <span>Techgear</span>
        </a>
        <p>A premium concept landing page for next-generation mobile technology.</p>
      </div>
      <div className="footer-links">
        <a href="#features">Products</a>
        <a href="#specs">Solutions</a>
        <a href="#story">Resources</a>
        <a href="#signup">Contact</a>
      </div>
      <small>Copyright {year} Techgear Concept. All rights reserved.</small>
    </footer>
  )
}
