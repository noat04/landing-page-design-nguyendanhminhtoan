import { useEffect, useMemo, useState } from 'react'
import { apiFetch, formatPrice, getProductImage } from '../lib/api.js'

const sortOptions = [
  ['newest', 'Mới nhất'],
  ['price_asc', 'Giá tăng'],
  ['price_desc', 'Giá giảm'],
]

export default function ProductsPage({ onRequireLogin, onCartChange }) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState({ type: 'loading', message: 'Đang tải sản phẩm...' })
  const [busyProductId, setBusyProductId] = useState('')
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
      setStatus({ type: 'loading', message: 'Đang tải sản phẩm...' })

      try {
        const data = await apiFetch(`/api/products?${searchParams}`)

        if (alive) {
          setProducts(data.items || [])
          setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
          setStatus({ type: 'idle', message: '' })
        }
      } catch (error) {
        if (alive) {
          setStatus({ type: 'error', message: error.message || 'Không thể tải sản phẩm.' })
        }
      }
    }

    loadProducts()

    return () => {
      alive = false
    }
  }, [searchParams])

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
      setStatus({ type: 'success', message: `Đã thêm ${product.name} vào giỏ hàng.` })
    } catch (error) {
      if (error.status === 401) {
        onRequireLogin()
        return
      }

      setStatus({ type: 'error', message: error.message || 'Không thể thêm vào giỏ hàng.' })
    } finally {
      setBusyProductId('')
    }
  }

  return (
    <section className="commerce-page">
      <div className="page-kicker">Cửa hàng</div>
      <div className="commerce-heading">
        <div>
          <h1>Danh sách sản phẩm</h1>
          <p>Chọn mẫu iPhone phù hợp, kiểm tra tồn kho và thêm nhanh vào giỏ hàng.</p>
        </div>
        <form className="product-toolbar" onSubmit={submitSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm sản phẩm"
            aria-label="Tìm sản phẩm"
          />
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sắp xếp sản phẩm">
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className="primary-button small" type="submit">
            Tìm
          </button>
        </form>
      </div>

      <p className={`commerce-status ${status.type}`}>{status.message || `${pagination.total} sản phẩm`}</p>

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
                <p className="product-description">{product.description || 'Sản phẩm chính hãng, sẵn sàng giao hàng.'}</p>
              </div>
              <div className="product-meta">
                <div>
                  <strong>{formatPrice(product.price, product.currency)}</strong>
                  {product.originalPrice ? <span>{formatPrice(product.originalPrice, product.currency)}</span> : null}
                </div>
                <em>{product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}</em>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => addToCart(product)}
                disabled={product.stock < 1 || busyProductId === product._id}
              >
                {busyProductId === product._id ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>
            </div>
          </article>
        ))}
      </div>

      {status.type !== 'loading' && products.length === 0 ? (
        <div className="empty-state">
          <h2>Chưa có sản phẩm phù hợp</h2>
          <p>Thử đổi từ khóa tìm kiếm hoặc kiểm tra lại dữ liệu seed ở backend.</p>
        </div>
      ) : null}

      {pagination.pages > 1 ? (
        <div className="pager" aria-label="Phân trang sản phẩm">
          <button className="ghost-button" type="button" onClick={() => setPage((current) => current - 1)} disabled={page <= 1}>
            Trước
          </button>
          <span>
            Trang {pagination.page} / {pagination.pages}
          </span>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pagination.pages}
          >
            Sau
          </button>
        </div>
      ) : null}
    </section>
  )
}
