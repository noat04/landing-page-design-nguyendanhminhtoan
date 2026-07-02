import { useEffect, useMemo, useState } from 'react'
import { apiFetch, formatPrice, getProductImage } from '../lib/api.js'

const sortOptions = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
]

export default function ProductsPage({ user, onRequireLogin, onCartChange, onNavigate }) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState({ type: 'loading', message: 'Loading products...' })
  const [busyProductId, setBusyProductId] = useState('')
  const [favoriteIds, setFavoriteIds] = useState(() => new Set())
  const [busyFavoriteId, setBusyFavoriteId] = useState('')
  const searchParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '12',
    })

    if (query.trim()) {
      params.set('q', query.trim())
    }

    if (sort !== 'newest') {
      params.set('sort', sort)
    }

    return params.toString()
  }, [page, query, sort])

  useEffect(() => {
    let alive = true

    const loadProducts = async () => {
      setStatus({ type: 'loading', message: 'Loading products...' })

      try {
        const data = await apiFetch(`/api/products?${searchParams}`)

        if (alive) {
          setProducts(data.items || [])
          setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
          setStatus({ type: 'idle', message: '' })
        }
      } catch (error) {
        if (alive) {
          setStatus({ type: 'error', message: error.message || 'Unable to load products.' })
        }
      }
    }

    loadProducts()

    return () => {
      alive = false
    }
  }, [searchParams])

  useEffect(() => {
    let alive = true

    const loadFavorites = async () => {
      if (!user) {
        setFavoriteIds(new Set())
        return
      }

      try {
        const data = await apiFetch('/api/favorites')

        if (alive) {
          setFavoriteIds(new Set((data.items || []).map((item) => item.product?._id).filter(Boolean)))
        }
      } catch {
        if (alive) {
          setFavoriteIds(new Set())
        }
      }
    }

    loadFavorites()

    return () => {
      alive = false
    }
  }, [user])

  const submitSearch = (event) => {
    event.preventDefault()
    setPage(1)
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
        onRequireLogin()
        return
      }

      setStatus({ type: 'error', message: error.message || 'Unable to add this product to your cart.' })
    } finally {
      setBusyProductId('')
    }
  }

  const toggleFavorite = async (product) => {
    if (!user) {
      onRequireLogin()
      return
    }

    const isFavorite = favoriteIds.has(product._id)
    setBusyFavoriteId(product._id)

    try {
      await apiFetch(`/api/favorites/${product._id}`, { method: isFavorite ? 'DELETE' : 'POST' })
      setFavoriteIds((currentIds) => {
        const nextIds = new Set(currentIds)

        if (isFavorite) {
          nextIds.delete(product._id)
        } else {
          nextIds.add(product._id)
        }

        return nextIds
      })
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
      setBusyFavoriteId('')
    }
  }

  return (
    <section className="commerce-page">
      <div className="page-kicker">Store</div>
      <div className="commerce-heading">
        <div>
          <h1>Product list</h1>
          <p>Choose the right iPhone model, check stock, and quickly add it to your cart.</p>
        </div>
        <form className="product-toolbar" onSubmit={submitSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            aria-label="Search products"
          />
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className="primary-button small" type="submit">
            Search
          </button>
        </form>
      </div>

      <p className={`commerce-status ${status.type}`}>{status.message || `${pagination.total} products`}</p>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
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
                {busyProductId === product._id ? 'Adding...' : 'Add to cart'}
              </button>
              <div className="product-actions">
                <button className="ghost-button" type="button" onClick={() => onNavigate('product-detail', product._id)}>
                  View details
                </button>
                <button
                  className={`favorite-button ${favoriteIds.has(product._id) ? 'active' : ''}`}
                  type="button"
                  aria-pressed={favoriteIds.has(product._id)}
                  onClick={() => toggleFavorite(product)}
                  disabled={busyFavoriteId === product._id}
                >
                  {favoriteIds.has(product._id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {status.type !== 'loading' && products.length === 0 ? (
        <div className="empty-state">
          <h2>No matching products</h2>
          <p>Try changing your search keyword or checking the seeded backend data.</p>
        </div>
      ) : null}

      {pagination.pages > 1 ? (
        <div className="pager" aria-label="Product pagination">
          <button className="ghost-button" type="button" onClick={() => setPage((current) => current - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span>
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pagination.pages}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  )
}
