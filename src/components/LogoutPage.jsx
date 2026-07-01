import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'

export default function LogoutPage({ onLogout, onNavigate }) {
  const [message, setMessage] = useState('Đang đăng xuất...')

  useEffect(() => {
    let alive = true

    const logout = async () => {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' })
        if (alive) {
          onLogout()
          setMessage('Bạn đã đăng xuất.')
          window.setTimeout(() => onNavigate('login'), 500)
        }
      } catch (error) {
        if (alive) {
          onLogout()
          setMessage(error.message || 'Không thể gọi API đăng xuất, phiên cục bộ đã được làm mới.')
        }
      }
    }

    logout()

    return () => {
      alive = false
    }
  }, [onLogout, onNavigate])

  return (
    <section className="commerce-page auth-page">
      <div className="page-kicker">Phiên đăng nhập</div>
      <div className="commerce-heading">
        <div>
          <h1>Đăng xuất</h1>
          <p>{message}</p>
        </div>
      </div>
    </section>
  )
}
