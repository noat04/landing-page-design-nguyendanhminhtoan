import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'

export default function LogoutPage({ onLogout, onNavigate }) {
  const [message, setMessage] = useState('Signing out...')

  useEffect(() => {
    let alive = true

    const logout = async () => {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' })
        if (alive) {
          onLogout()
          setMessage('You have signed out.')
          window.setTimeout(() => onNavigate('login'), 500)
        }
      } catch (error) {
        if (alive) {
          onLogout()
          setMessage(error.message || 'Unable to call the sign-out API. Your local session was refreshed.')
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
      <div className="page-kicker">Session</div>
      <div className="commerce-heading">
        <div>
          <h1>Sign out</h1>
          <p>{message}</p>
        </div>
      </div>
    </section>
  )
}
