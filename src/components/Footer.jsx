import AppleLogo from './AppleLogo.jsx'

export default function Footer({ year }) {
  return (
    <footer className="site-footer">
      <div>
        <a className="brand" href="#top" aria-label="Techgear home">
          <span className="brand-mark">
            <AppleLogo />
          </span>
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
      <div className="footer-contact">
        <small>Designed by Nguyen Danh Minh Toan</small>
        <small>Contact: 0765593697</small>
        <small>Email: toannguyen041214</small>
        <small>
          GitHub:{' '}
          <a href="https://github.com/noat04" target="_blank" rel="noreferrer">
            github.com/noat04
          </a>
        </small>
        <small>Copyright {year} Techgear Concept. All rights reserved.</small>
      </div>
    </footer>
  )
}
