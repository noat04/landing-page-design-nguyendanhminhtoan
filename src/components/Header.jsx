export default function Header({ cartCount, currentView, theme, user, onNavigate, onToggleTheme, onTrackClick }) {
  const handleHomeClick = () => {
    onNavigate('home')
    onTrackClick('home')
  }

  return (
    <header className="site-header">
      <button className="brand brand-button" type="button" onClick={handleHomeClick} aria-label="Techgear home">
        <span className="brand-mark">18</span>
        <span>Techgear</span>
      </button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <button type="button" onClick={() => onNavigate('products')} aria-current={currentView === 'products' ? 'page' : undefined}>
          Sản phẩm
        </button>
        <button type="button" onClick={() => onNavigate('cart')} aria-current={currentView === 'cart' ? 'page' : undefined}>
          Giỏ hàng {cartCount > 0 ? `(${cartCount})` : ''}
        </button>
        <a href="#features" onClick={() => onNavigate('home')}>
          Features
        </a>
        <a href="#specs" onClick={() => onNavigate('home')}>
          Specifications
        </a>
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
