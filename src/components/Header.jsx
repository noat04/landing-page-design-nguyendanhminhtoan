import { useEffect, useId, useState } from 'react'
import AppleLogo from './AppleLogo.jsx'

export default function Header({ cartCount, currentView, theme, user, onNavigate, onToggleTheme, onTrackClick }) {
  const displayName = user?.name || user?.email
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const mobileNavId = useId()

  const handleHomeClick = (sectionId = 'top') => {
    onNavigate('home', sectionId)
    onTrackClick(sectionId === 'top' ? 'home' : sectionId)
    setMenuIsOpen(false)
  }

  const handleNavigate = (view) => {
    onNavigate(view)
    setMenuIsOpen(false)
  }

  useEffect(() => {
    if (!menuIsOpen) {
      return undefined
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuIsOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuIsOpen])

  const navItems = [
    { label: 'Features', onClick: () => handleHomeClick('features') },
    { label: 'Specifications', onClick: () => handleHomeClick('specs') },
    { label: 'Design', onClick: () => handleHomeClick('story') },
    { label: 'Register', onClick: () => handleHomeClick('signup') },
    {
      label: 'Products',
      onClick: () => handleNavigate('products'),
      current: currentView === 'products' || currentView === 'product-detail',
    },
    ...(user
      ? [{ label: 'Favorites', onClick: () => handleNavigate('favorites'), current: currentView === 'favorites' }]
      : []),
    { label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}`, onClick: () => handleNavigate('cart'), current: currentView === 'cart' },
  ]

  const renderNavItems = () =>
    navItems.map((item) => (
      <button key={item.label} type="button" onClick={item.onClick} aria-current={item.current ? 'page' : undefined}>
        {item.label}
      </button>
    ))

  return (
    <header className={`site-header ${menuIsOpen ? 'menu-open' : ''}`}>
      <button className="brand brand-button" type="button" onClick={() => handleHomeClick()} aria-label="Techgear home">
        <span className="brand-mark">
          <AppleLogo />
        </span>
        <span>Iphone</span>
      </button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {renderNavItems()}
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label="Toggle color mode">
          {theme === 'dark' ? 'SUN' : 'MOON'}
        </button>
        {user ? (
          <div className="user-session" aria-label="Signed-in account">
            <span title={displayName}>{displayName}</span>
            <button className="ghost-button" type="button" onClick={() => handleNavigate('logout')}>
              Sign out
            </button>
          </div>
        ) : (
          <button className="ghost-button" type="button" onClick={() => handleNavigate('login')}>
            Sign in
          </button>
        )}
        <button className="primary-button small" type="button" onClick={() => handleNavigate('products')}>
          Shop now
        </button>
        <button
          className="menu-toggle"
          type="button"
          aria-controls={mobileNavId}
          aria-expanded={menuIsOpen}
          aria-label={menuIsOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuIsOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav id={mobileNavId} className="mobile-nav" aria-label="Mobile navigation">
        {renderNavItems()}
      </nav>
    </header>
  )
}
