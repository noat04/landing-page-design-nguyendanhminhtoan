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
    setStatus({ type: 'loading', message: isRegister ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...' })

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
      setStatus({ type: 'success', message: isRegister ? 'Tài khoản đã sẵn sàng.' : 'Đăng nhập thành công.' })
      onAuthSuccess(data.user)
      onNavigate('products')
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Không thể đăng nhập lúc này.' })
    }
  }

  return (
    <section className="commerce-page auth-page">
      <div className="page-kicker">Tài khoản</div>
      <div className="commerce-heading">
        <div>
          <h1>{isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập'}</h1>
          <p>
            {isRegister
              ? 'Tạo tài khoản để lưu giỏ hàng và theo dõi sản phẩm yêu thích.'
              : 'Đăng nhập để thêm sản phẩm vào giỏ hàng và tiếp tục mua sắm.'}
          </p>
        </div>
        <div className="auth-switch" role="tablist" aria-label="Chọn chế độ tài khoản">
          <button
            className={mode === 'login' ? 'active' : ''}
            type="button"
            onClick={() => setMode('login')}
            role="tab"
            aria-selected={mode === 'login'}
          >
            Đăng nhập
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            type="button"
            onClick={() => setMode('register')}
            role="tab"
            aria-selected={mode === 'register'}
          >
            Đăng ký
          </button>
        </div>
      </div>

      <form className="auth-panel" onSubmit={submitForm}>
        {isRegister ? (
          <label>
            <span>Họ tên</span>
            <input name="name" value={form.name} onChange={updateField} minLength="2" maxLength="80" required />
          </label>
        ) : null}
        <label>
          <span>Email</span>
          <input name="email" value={form.email} onChange={updateField} type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Mật khẩu</span>
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
          {status.type === 'loading' ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
        </button>
        <p className={`form-message ${status.type === 'error' ? 'error' : status.type === 'success' ? 'success' : ''}`}>
          {status.message}
        </p>
      </form>
    </section>
  )
}
