export default function Signup({ form, formState, onFieldChange, onSubmit }) {
  return (
    <section id="signup" className="signup-section reveal">
      <div>
        <p className="eyebrow">Stay in the loop</p>
        <h2>Be the first to know.</h2>
        <p>Get updates on availability, new features, launch events, and exclusive offers.</p>
      </div>
      <form className="signup-form" onSubmit={onSubmit} noValidate>
        <label>
          <span>Full name</span>
          <input name="name" value={form.name} onChange={onFieldChange} placeholder="Full name" autoComplete="name" />
        </label>
        <label>
          <span>Email address</span>
          <input
            name="email"
            value={form.email}
            onChange={onFieldChange}
            placeholder="Email address"
            autoComplete="email"
            inputMode="email"
          />
        </label>
        <button className="primary-button" type="submit" disabled={formState.type === 'loading'}>
          {formState.type === 'loading' ? 'Sending...' : 'Notify me'}
        </button>
        <p className={`form-message ${formState.type}`}>
          {formState.message || 'Secure webhook-ready validation.'}
        </p>
      </form>
    </section>
  )
}
