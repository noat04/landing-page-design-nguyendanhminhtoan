import { useState } from 'react'
import { apiFetch } from '../lib/api.js'

const initialForm = {
  name: '',
  email: '',
  password: '',
}

export default function AuthPage({ onAuthSuccess, onNavigate }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const isRegister = mode === 'register'

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })

    if (status.type === 'error') {
      setStatus({ type: 'idle', message: '' })
    }
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setStatus({ type: 'loading', message: isRegister ? 'Creating your account...' : 'Signing in...' })

    try {
      const payload = isRegister
        ? {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
          }
        : {
            email: form.email.trim().toLowerCase(),
            password: form.password,
          }
      const data = await apiFetch(`/api/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        body: payload,
      })

      setForm(initialForm)
      setStatus({ type: 'success', message: isRegister ? 'Your account is ready.' : 'Signed in successfully.' })
      onAuthSuccess(data.user)
      onNavigate('products')
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to sign in right now.' })
    }
  }

  return (
    <section className="commerce-page auth-page">
      <div className="page-kicker">Account</div>
      <div className="commerce-heading">
        <div>
          <h1>{isRegister ? 'Create a new account' : 'Sign in'}</h1>
          <p>
            {isRegister
              ? 'Create an account to save your cart and track favorite products.'
              : 'Sign in to add products to your cart and keep shopping.'}
          </p>
        </div>
        <div className="auth-switch" role="tablist" aria-label="Choose account mode">
          <button
            className={mode === 'login' ? 'active' : ''}
            type="button"
            onClick={() => setMode('login')}
            role="tab"
            aria-selected={mode === 'login'}
          >
            Sign in
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            type="button"
            onClick={() => setMode('register')}
            role="tab"
            aria-selected={mode === 'register'}
          >
            Register
          </button>
        </div>
      </div>

      <form className="auth-panel" onSubmit={submitForm}>
        {isRegister ? (
          <label>
            <span>Full name</span>
            <input name="name" value={form.name} onChange={updateField} minLength="2" maxLength="80" required />
          </label>
        ) : null}
        <label>
          <span>Email</span>
          <input name="email" value={form.email} onChange={updateField} type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Password</span>
          <input
            name="password"
            value={form.password}
            onChange={updateField}
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength="6"
            maxLength="128"
            required
          />
        </label>
        <button className="primary-button" type="submit" disabled={status.type === 'loading'}>
          {status.type === 'loading' ? 'Processing...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
        <p className={`form-message ${status.type === 'error' ? 'error' : status.type === 'success' ? 'success' : ''}`}>
          {status.message}
        </p>
      </form>
    </section>
  )
}
