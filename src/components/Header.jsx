export default function Header({ theme, onToggleTheme, onTrackClick }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Techgear home">
        <span className="brand-mark">18</span>
        <span>Techgear</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <a href="#features">Features</a>
        <a href="#specs">Specifications</a>
        <a href="#story">Design</a>
        <a href="#signup">Register</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label="Toggle color mode">
          {theme === 'dark' ? 'SUN' : 'MOON'}
        </button>
        <button className="ghost-button" type="button" onClick={() => onTrackClick('sign in')}>
          Sign in
        </button>
        <button className="primary-button small" type="button" onClick={() => onTrackClick('register')}>
          Register
        </button>
      </div>
    </header>
  )
}
