import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AuthPage from './components/AuthPage.jsx'
import CartPage from './components/CartPage.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import LogoutPage from './components/LogoutPage.jsx'
import ProductsPage from './components/ProductsPage.jsx'
import Toast from './components/Toast.jsx'
import { bannerFallbackImage, bannerImage, features, productFilmId, specs, storyCards } from './data/landingData.js'
import { apiFetch } from './lib/api.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Features = lazy(() => import('./components/Features.jsx'))
const Footer = lazy(() => import('./components/Footer.jsx'))
const ProductFilm = lazy(() => import('./components/ProductFilm.jsx'))
const ProofRow = lazy(() => import('./components/ProofRow.jsx'))
const Signup = lazy(() => import('./components/Signup.jsx'))
const Specs = lazy(() => import('./components/Specs.jsx'))
const Story = lazy(() => import('./components/Story.jsx'))

const commerceViews = new Set(['login', 'logout', 'products', 'cart'])

function getViewFromLocation() {
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view')

  return commerceViews.has(view) ? view : 'home'
}

function setViewInUrl(view) {
  const url = new URL(window.location.href)

  if (view === 'home') {
    url.searchParams.delete('view')
    url.hash = 'top'
  } else {
    url.searchParams.set('view', view)
    url.hash = ''
  }

  window.history.pushState({}, '', url)
}

function LazyWhenVisible({ children, minHeight = 360 }) {
  const placeholderRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (shouldRender) {
      window.dispatchEvent(new Event('landing:lazy-section-mounted'))
      return undefined
    }

    const placeholder = placeholderRef.current

    if (!placeholder || !('IntersectionObserver' in window)) {
      setShouldRender(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin: '720px 0px' },
    )

    observer.observe(placeholder)

    return () => observer.disconnect()
  }, [shouldRender])

  const fallback = <div className="lazy-section-placeholder" style={{ minHeight }} aria-hidden="true" />

  if (!shouldRender) {
    return <div ref={placeholderRef} className="lazy-section-placeholder" style={{ minHeight }} aria-hidden="true" />
  }

  return <Suspense fallback={fallback}>{children}</Suspense>
}

function normalizeSignupData(form) {
  return {
    name: form.name.trim().replace(/\s+/g, ' '),
    email: form.email.trim().toLowerCase(),
  }
}

function validateSignupData(data) {
  if (data.name.length < 2) {
    return 'Please enter your full name.'
  }

  if (data.name.length > 80) {
    return 'Please keep your name under 80 characters.'
  }

  if (!emailPattern.test(data.email)) {
    return 'Please enter a valid email address.'
  }

  if (data.email.length > 120) {
    return 'Please keep your email under 120 characters.'
  }

  return ''
}

function createBehaviorEvent(type, label, detail = {}) {
  return {
    type,
    label,
    detail,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  }
}

function App() {
  const [currentView, setCurrentView] = useState(getViewFromLocation)
  const [theme, setTheme] = useState('dark')
  const [toast, setToast] = useState('Scroll to explore the story.')
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [form, setForm] = useState({ name: '', email: '' })
  const [formState, setFormState] = useState({ type: 'idle', message: '' })
  const behaviorEventsRef = useRef([])
  const trackedScrollDepthsRef = useRef(new Set())
  const year = useMemo(() => new Date().getFullYear(), [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const navigate = useCallback((view) => {
    setCurrentView(view)
    setViewInUrl(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const refreshCartCount = useCallback(async () => {
    try {
      const data = await apiFetch('/api/cart')
      setCartCount(data.totals?.totalItems || 0)
    } catch {
      setCartCount(0)
    }
  }, [])

  const handleAuthSuccess = useCallback(
    (nextUser) => {
      setUser(nextUser)
      setToast(`Xin chào ${nextUser.name || nextUser.email}.`)
      refreshCartCount()
    },
    [refreshCartCount],
  )

  const handleLogout = useCallback(() => {
    setUser(null)
    setCartCount(0)
    setToast('Bạn đã đăng xuất.')
  }, [])

  useEffect(() => {
    const onPopState = () => {
      setCurrentView(getViewFromLocation())
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    let alive = true

    const loadSession = async () => {
      try {
        const data = await apiFetch('/api/auth/me')

        if (alive) {
          setUser(data.user)
          refreshCartCount()
        }
      } catch {
        if (alive) {
          setUser(null)
          setCartCount(0)
        }
      }
    }

    loadSession()

    return () => {
      alive = false
    }
  }, [refreshCartCount])

  useEffect(() => {
    let ctx
    let cancelled = false
    let loaded = false
    let setupLazyAnimations

    const loadScrollAnimations = async () => {
      if (loaded) {
        return
      }

      loaded = true
      window.removeEventListener('scroll', loadScrollAnimations)
      window.removeEventListener('pointerdown', loadScrollAnimations)
      window.removeEventListener('keydown', loadScrollAnimations)

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      if (cancelled) {
        return
      }

      gsap.registerPlugin(ScrollTrigger)

      const revealItems = new WeakSet()
      const storyCards = new WeakSet()

      setupLazyAnimations = () => {
        gsap.utils.toArray('.reveal').forEach((item) => {
          if (revealItems.has(item)) {
            return
          }

          revealItems.add(item)
          gsap.from(item, {
            y: 44,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 84%',
            },
          })
        })

        gsap.utils.toArray('.story-card').forEach((card, index) => {
          if (storyCards.has(card)) {
            return
          }

          storyCards.add(card)
          gsap.to(card, {
            yPercent: index % 2 === 0 ? -7 : 7,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        })

        ScrollTrigger.refresh()
      }

      ctx = gsap.context(() => {
        gsap.to('.hero-banner-wrap', {
          yPercent: 9,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })

        setupLazyAnimations()
      })

      window.addEventListener('landing:lazy-section-mounted', setupLazyAnimations)
    }

    window.addEventListener('scroll', loadScrollAnimations, { once: true, passive: true })
    window.addEventListener('pointerdown', loadScrollAnimations, { once: true, passive: true })
    window.addEventListener('keydown', loadScrollAnimations, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('scroll', loadScrollAnimations)
      window.removeEventListener('pointerdown', loadScrollAnimations)
      window.removeEventListener('keydown', loadScrollAnimations)

      if (setupLazyAnimations) {
        window.removeEventListener('landing:lazy-section-mounted', setupLazyAnimations)
      }

      if (ctx) {
        ctx.revert()
      }
    }
  }, [])

  const recordBehavior = useCallback((type, label, detail = {}) => {
    const trackedEvent = createBehaviorEvent(type, label, detail)
    behaviorEventsRef.current = [...behaviorEventsRef.current.slice(-9), trackedEvent]
    setToast(`${type === 'scroll' ? 'Scroll' : 'Click'} tracked: ${label}`)
    return trackedEvent
  }, [])

  const trackClick = useCallback(
    (label) => {
      recordBehavior('click', label)
    },
    [recordBehavior],
  )

  useEffect(() => {
    const onScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight

      if (scrollableHeight <= 0) {
        return
      }

      const scrollDepth = Math.round((window.scrollY / scrollableHeight) * 100)
      const milestone = [25, 50, 75].find((depth) => scrollDepth >= depth && !trackedScrollDepthsRef.current.has(depth))

      if (milestone) {
        trackedScrollDepthsRef.current.add(milestone)
        recordBehavior('scroll', `${milestone}% page depth`, { depth: milestone })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [recordBehavior])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })

    if (formState.type === 'error') {
      setFormState({ type: 'idle', message: '' })
    }
  }

  const submitForm = async (event) => {
    event.preventDefault()
    const validatedData = normalizeSignupData(form)
    const validationMessage = validateSignupData(validatedData)

    if (validationMessage) {
      setFormState({ type: 'error', message: validationMessage })
      recordBehavior('click', 'newsletter validation failed', { reason: validationMessage })
      return
    }

    setFormState({ type: 'loading', message: 'Sending secure request...' })
    const submitEvent = recordBehavior('click', 'newsletter form submitted')

    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL
    const webhookIsConfigured = Boolean(webhookUrl)
    const payload = {
      ...validatedData,
      source: 'Nova X Pro landing page',
      pageUrl: window.location.href,
      userAgent: window.navigator.userAgent,
      submittedAt: new Date().toISOString(),
      behavior: [...behaviorEventsRef.current, submitEvent],
    }

    try {
      if (webhookIsConfigured) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`Webhook responded with ${response.status}`)
        }
      } else {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 650)
        })
      }

      setFormState({
        type: 'success',
        message: webhookIsConfigured
          ? 'Thanks. Your request was sent to the webhook.'
          : 'Thanks. Demo validation passed. Add VITE_WEBHOOK_URL to send data.',
      })
      setForm({ name: '', email: '' })
      recordBehavior('click', webhookIsConfigured ? 'webhook submission succeeded' : 'demo submission succeeded')
    } catch {
      setFormState({ type: 'error', message: 'Webhook failed. Please try again in a moment.' })
      recordBehavior('click', 'webhook submission failed')
    }
  }

  const renderCurrentView = () => {
    if (currentView === 'login') {
      return <AuthPage onAuthSuccess={handleAuthSuccess} onNavigate={navigate} />
    }

    if (currentView === 'logout') {
      return <LogoutPage onLogout={handleLogout} onNavigate={navigate} />
    }

    if (currentView === 'products') {
      return (
        <ProductsPage
          onCartChange={setCartCount}
          onRequireLogin={() => {
            setToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
            navigate('login')
          }}
        />
      )
    }

    if (currentView === 'cart') {
      return <CartPage onCartChange={setCartCount} onNavigate={navigate} />
    }

    return (
      <>
        <Hero bannerFallbackImage={bannerFallbackImage} bannerImage={bannerImage} onTrackClick={trackClick} />
        <LazyWhenVisible minHeight={430}>
          <ProductFilm productFilmId={productFilmId} />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={380}>
          <Features features={features} />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={330}>
          <Specs specs={specs} />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={520}>
          <Story storyCards={storyCards} />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={470}>
          <Signup form={form} formState={formState} onFieldChange={updateField} onSubmit={submitForm} />
          <ProofRow />
          <Footer year={year} />
        </LazyWhenVisible>
      </>
    )
  }

  return (
    <main className="app-shell">
      <Toast message={toast} />
      <Header
        cartCount={cartCount}
        currentView={currentView}
        theme={theme}
        user={user}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
        onTrackClick={trackClick}
      />
      {renderCurrentView()}
    </main>
  )
}

export default App
