export default function Header({ cartCount, currentView, theme, user, onNavigate, onToggleTheme, onTrackClick }) {
  const handleHomeClick = (sectionId = 'top') => {
    onNavigate('home', sectionId)
    onTrackClick(sectionId === 'top' ? 'home' : sectionId)
  }

  return (
    <header className="site-header">
      <button className="brand brand-button" type="button" onClick={() => handleHomeClick()} aria-label="Techgear home">
        <span className="brand-mark">18</span>
        <span>Techgear</span>
      </button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <button type="button" onClick={() => handleHomeClick('features')}>
          Features
        </button>
        <button type="button" onClick={() => handleHomeClick('specs')}>
          Specifications
        </button>
        <button type="button" onClick={() => handleHomeClick('story')}>
          Design
        </button>
        <button type="button" onClick={() => handleHomeClick('signup')}>
          Register
        </button>
        <button type="button" onClick={() => onNavigate('products')} aria-current={currentView === 'products' ? 'page' : undefined}>
          Sản phẩm
        </button>
        <button type="button" onClick={() => onNavigate('cart')} aria-current={currentView === 'cart' ? 'page' : undefined}>
          Giỏ hàng {cartCount > 0 ? `(${cartCount})` : ''}
        </button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label="Toggle color mode">
          {theme === 'dark' ? 'SUN' : 'MOON'}
        </button>
        {user ? (
          <button className="ghost-button" type="button" onClick={() => onNavigate('logout')}>
            Đăng xuất
          </button>
        ) : (
          <button className="ghost-button" type="button" onClick={() => onNavigate('login')}>
            Đăng nhập
          </button>
        )}
        <button className="primary-button small" type="button" onClick={() => onNavigate('products')}>
          Mua ngay
        </button>
      </div>
    </header>
  )
}
