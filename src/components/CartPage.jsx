import { useCallback, useEffect, useState } from 'react'
import { apiFetch, formatPrice, getProductImage } from '../lib/api.js'

const emptyTotals = {
  subtotal: 0,
  currency: 'VND',
  totalItems: 0,
}

export default function CartPage({ onCartChange, onNavigate }) {
  const [cart, setCart] = useState({ items: [] })
  const [totals, setTotals] = useState(emptyTotals)
  const [status, setStatus] = useState({ type: 'loading', message: 'Đang tải giỏ hàng...' })
  const [busyProductId, setBusyProductId] = useState('')

  const applyCart = useCallback((data) => {
    setCart(data.cart || { items: [] })
    setTotals(data.totals || emptyTotals)
    onCartChange(data.totals?.totalItems || 0)
  }, [onCartChange])

  useEffect(() => {
    let alive = true

    const loadCart = async () => {
      setStatus({ type: 'loading', message: 'Đang tải giỏ hàng...' })

      try {
        const data = await apiFetch('/api/cart')

        if (alive) {
          applyCart(data)
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

        setStatus({ type: 'error', message: error.message || 'Không thể tải giỏ hàng.' })
      }
    }

    loadCart()

    return () => {
      alive = false
    }
  }, [applyCart, onNavigate])

  const updateQuantity = async (productId, quantity) => {
    setBusyProductId(productId)

    try {
      const data = await apiFetch(`/api/cart/items/${productId}`, {
        method: 'PATCH',
        body: { quantity },
      })
      applyCart(data)
      setStatus({ type: 'idle', message: '' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Không thể cập nhật giỏ hàng.' })
    } finally {
      setBusyProductId('')
    }
  }

  const removeItem = async (productId) => {
    setBusyProductId(productId)

    try {
      const data = await apiFetch(`/api/cart/items/${productId}`, { method: 'DELETE' })
      applyCart(data || { cart: { items: [] }, totals: emptyTotals })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Không thể xóa sản phẩm.' })
    } finally {
      setBusyProductId('')
    }
  }

  const clearCart = async () => {
    setBusyProductId('all')

    try {
      const data = await apiFetch('/api/cart', { method: 'DELETE' })
      applyCart(data)
      setStatus({ type: 'success', message: 'Giỏ hàng đã được làm trống.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Không thể xóa giỏ hàng.' })
    } finally {
      setBusyProductId('')
    }
  }

  return (
    <section className="commerce-page">
      <div className="page-kicker">Thanh toán</div>
      <div className="commerce-heading">
        <div>
          <h1>Giỏ hàng</h1>
          <p>Kiểm tra sản phẩm, điều chỉnh số lượng và chuẩn bị đặt hàng.</p>
        </div>
        <button className="ghost-button" type="button" onClick={() => onNavigate('products')}>
          Tiếp tục mua
        </button>
      </div>

      <p className={`commerce-status ${status.type}`}>{status.message || `${totals.totalItems} sản phẩm trong giỏ`}</p>

      {cart.items?.length ? (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.items.map((item) => {
              const product = item.product

              if (!product) {
                return null
              }

              return (
                <article className="cart-item" key={product._id}>
                  <div className="cart-media">
                    <img src={getProductImage(product)} alt={product.images?.[0]?.alt || product.name} loading="lazy" />
                  </div>
                  <div className="cart-info">
                    <p className="product-category">{product.category}</p>
                    <h2>{product.name}</h2>
                    <strong>{formatPrice(product.price, product.currency)}</strong>
                  </div>
                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label="Giảm số lượng"
                      onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1 || busyProductId === product._id}
                    >
                      -
                    </button>
                    <input
                      value={item.quantity}
                      aria-label={`Số lượng ${product.name}`}
                      onChange={(event) => {
                        const quantity = Number(event.target.value)

                        if (Number.isInteger(quantity) && quantity > 0 && quantity <= 99) {
                          updateQuantity(product._id, quantity)
                        }
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Tăng số lượng"
                      onClick={() => updateQuantity(product._id, Math.min(99, item.quantity + 1))}
                      disabled={busyProductId === product._id}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => removeItem(product._id)}
                    disabled={busyProductId === product._id}
                  >
                    Xóa
                  </button>
                </article>
              )
            })}
          </div>

          <aside className="cart-summary" aria-label="Tóm tắt giỏ hàng">
            <h2>Tóm tắt</h2>
            <div>
              <span>Tạm tính</span>
              <strong>{formatPrice(totals.subtotal, totals.currency)}</strong>
            </div>
            <div>
              <span>Số lượng</span>
              <strong>{totals.totalItems}</strong>
            </div>
            <button className="primary-button" type="button">
              Đặt hàng
            </button>
            <button className="ghost-button" type="button" onClick={clearCart} disabled={busyProductId === 'all'}>
              Làm trống giỏ
            </button>
          </aside>
        </div>
      ) : status.type !== 'loading' ? (
        <div className="empty-state">
          <h2>Giỏ hàng đang trống</h2>
          <p>Thêm một sản phẩm từ danh sách để bắt đầu đơn hàng.</p>
          <button className="primary-button" type="button" onClick={() => onNavigate('products')}>
            Xem sản phẩm
          </button>
        </div>
      ) : null}
    </section>
  )
}
