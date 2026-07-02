import { useEffect, useMemo, useState } from 'react'
import { apiFetch, formatPrice, getProductImage } from '../lib/api.js'

function readSpecs(product) {
  if (!product?.specs) {
    return []
  }

  if (Array.isArray(product.specs)) {
    return product.specs
  }

  return Object.entries(product.specs)
}

export default function ProductDetailPage({ productId, user, onCartChange, onNavigate, onRequireLogin }) {
  const [product, setProduct] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [status, setStatus] = useState({ type: 'loading', message: 'Loading product...' })
  const [busyAction, setBusyAction] = useState('')
  const specs = useMemo(() => readSpecs(product), [product])

  useEffect(() => {
    let alive = true

    const loadProduct = async () => {
      if (!productId) {
        setStatus({ type: 'error', message: 'Missing product information.' })
        return
      }

      setStatus({ type: 'loading', message: 'Loading product...' })

      try {
        const data = await apiFetch(`/api/products/${productId}`)

        if (alive) {
          setProduct(data.product)
          setStatus({ type: 'idle', message: '' })
        }
      } catch (error) {
        if (alive) {
          setStatus({ type: 'error', message: error.message || 'Unable to load this product.' })
        }
      }
    }

    loadProduct()

    return () => {
      alive = false
    }
  }, [productId])

  useEffect(() => {
    let alive = true

    const loadFavoriteState = async () => {
      if (!user || !productId) {
        setIsFavorite(false)
        return
      }

      try {
        const data = await apiFetch('/api/favorites')
        const favoriteExists = (data.items || []).some((item) => item.product?._id === productId)

        if (alive) {
          setIsFavorite(favoriteExists)
        }
      } catch {
        if (alive) {
          setIsFavorite(false)
        }
      }
    }

    loadFavoriteState()

    return () => {
      alive = false
    }
  }, [productId, user])

  const addToCart = async () => {
    if (!product) {
      return
    }

    setBusyAction('cart')

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
      setBusyAction('')
    }
  }

  const toggleFavorite = async () => {
    if (!product) {
      return
    }

    if (!user) {
      onRequireLogin()
      return
    }

    setBusyAction('favorite')

    try {
      await apiFetch(`/api/favorites/${product._id}`, { method: isFavorite ? 'DELETE' : 'POST' })
      setIsFavorite((currentValue) => !currentValue)
      setStatus({
        type: 'success',
        message: isFavorite ? `${product.name} was removed from favorites.` : `${product.name} was saved to favorites.`,
      })
    } catch (error) {
      if (error.status === 401) {
        onRequireLogin()
        return
      }

      setStatus({ type: 'error', message: error.message || 'Unable to update favorites.' })
    } finally {
      setBusyAction('')
    }
  }

  return (
    <section className="commerce-page">
      <div className="page-kicker">Product detail</div>
      <div className="commerce-heading">
        <div>
          <h1>{product?.name || 'Product detail'}</h1>
          <p>{product?.description || 'Review product details, stock, specs, and save it to your favorites.'}</p>
        </div>
        <button className="ghost-button" type="button" onClick={() => onNavigate('products')}>
          Back to products
        </button>
      </div>

      <p className={`commerce-status ${status.type}`}>{status.message || 'Ready to shop'}</p>

      {product ? (
        <div className="product-detail-layout">
          <div className="product-detail-media">
            <img src={getProductImage(product)} alt={product.images?.[0]?.alt || product.name} />
          </div>
          <div className="product-detail-info">
            <p className="product-category">{product.category}</p>
            <h2>{product.name}</h2>
            <div className="detail-price-row">
              <strong>{formatPrice(product.price, product.currency)}</strong>
              {product.originalPrice ? <span>{formatPrice(product.originalPrice, product.currency)}</span> : null}
            </div>
            <p className="detail-stock">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
            <p className="detail-description">{product.description || 'Authentic product, ready to ship.'}</p>

            {specs.length ? (
              <dl className="spec-list">
                {specs.map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="detail-actions">
              <button
                className="primary-button"
                type="button"
                onClick={addToCart}
                disabled={product.stock < 1 || busyAction === 'cart'}
              >
                {busyAction === 'cart' ? 'Adding...' : 'Add to cart'}
              </button>
              <button
                className={`favorite-button large ${isFavorite ? 'active' : ''}`}
                type="button"
                aria-pressed={isFavorite}
                onClick={toggleFavorite}
                disabled={busyAction === 'favorite'}
              >
                {isFavorite ? 'Saved to favorites' : 'Save favorite'}
              </button>
            </div>
          </div>
        </div>
      ) : status.type !== 'loading' ? (
        <div className="empty-state">
          <h2>Product not found</h2>
          <p>This product may be unavailable or removed from the store.</p>
          <button className="primary-button" type="button" onClick={() => onNavigate('products')}>
            View products
          </button>
        </div>
      ) : null}
    </section>
  )
}
