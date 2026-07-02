import { useEffect, useState } from 'react'
import { apiFetch, formatPrice, getProductImage } from '../lib/api.js'

export default function FavoritesPage({ onCartChange, onNavigate }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState({ type: 'loading', message: 'Loading favorites...' })
  const [busyProductId, setBusyProductId] = useState('')

  useEffect(() => {
    let alive = true

    const loadFavorites = async () => {
      setStatus({ type: 'loading', message: 'Loading favorites...' })

      try {
        const data = await apiFetch('/api/favorites')

        if (alive) {
          setItems((data.items || []).filter((item) => item.product))
          setStatus({ type: 'idle', message: '' })
        }
      } catch (error) {
        if (!alive) {
          return
        }

        if (error.status === 401) {
          onNavigate('login')
          return
        }

        setStatus({ type: 'error', message: error.message || 'Unable to load favorites.' })
      }
    }

    loadFavorites()

    return () => {
      alive = false
    }
  }, [onNavigate])

  const removeFavorite = async (product) => {
    setBusyProductId(product._id)

    try {
      await apiFetch(`/api/favorites/${product._id}`, { method: 'DELETE' })
      setItems((currentItems) => currentItems.filter((item) => item.product?._id !== product._id))
      setStatus({ type: 'success', message: `${product.name} was removed from favorites.` })
    } catch (error) {
      if (error.status === 401) {
        onNavigate('login')
        return
      }

      setStatus({ type: 'error', message: error.message || 'Unable to remove this favorite.' })
    } finally {
      setBusyProductId('')
    }
  }

  const addToCart = async (product) => {
    setBusyProductId(product._id)

    try {
      const data = await apiFetch('/api/cart/items', {
        method: 'POST',
        body: {
          productId: product._id,
          quantity: 1,
        },
      })
      onCartChange(data.totals?.totalItems || 0)
      setStatus({ type: 'success', message: `${product.name} was added to your cart.` })
    } catch (error) {
      if (error.status === 401) {
        onNavigate('login')
        return
      }

      setStatus({ type: 'error', message: error.message || 'Unable to add this product to your cart.' })
    } finally {
      setBusyProductId('')
    }
  }

  return (
    <section className="commerce-page">
      <div className="page-kicker">Saved</div>
      <div className="commerce-heading">
        <div>
          <h1>Favorites</h1>
          <p>Your saved products are kept with your account, ready for comparison or checkout later.</p>
        </div>
        <button className="ghost-button" type="button" onClick={() => onNavigate('products')}>
          Continue shopping
        </button>
      </div>

      <p className={`commerce-status ${status.type}`}>{status.message || `${items.length} saved products`}</p>

      {items.length ? (
        <div className="product-grid">
          {items.map((item) => {
            const product = item.product

            return (
              <article className="product-card" key={item._id || product._id}>
                <div className="product-media">
                  <img src={getProductImage(product)} alt={product.images?.[0]?.alt || product.name} loading="lazy" />
                </div>
                <div className="product-body">
                  <div>
                    <p className="product-category">{product.category}</p>
                    <h2>{product.name}</h2>
                    <p className="product-description">{product.description || 'Authentic product, ready to ship.'}</p>
                  </div>
                  <div className="product-meta">
                    <div>
                      <strong>{formatPrice(product.price, product.currency)}</strong>
                      {product.originalPrice ? <span>{formatPrice(product.originalPrice, product.currency)}</span> : null}
                    </div>
                    <em>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</em>
                  </div>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={product.stock < 1 || busyProductId === product._id}
                  >
                    {busyProductId === product._id ? 'Working...' : 'Add to cart'}
                  </button>
                  <div className="product-actions">
                    <button className="ghost-button" type="button" onClick={() => onNavigate('product-detail', product._id)}>
                      View details
                    </button>
                    <button
                      className="favorite-button active"
                      type="button"
                      onClick={() => removeFavorite(product)}
                      disabled={busyProductId === product._id}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : status.type !== 'loading' ? (
        <div className="empty-state">
          <h2>No favorite products yet</h2>
          <p>Save products from the store to build your shortlist.</p>
          <button className="primary-button" type="button" onClick={() => onNavigate('products')}>
            Browse products
          </button>
        </div>
      ) : null}
    </section>
  )
}
