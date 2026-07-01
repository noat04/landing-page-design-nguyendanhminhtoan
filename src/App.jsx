import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Toast from './components/Toast.jsx'
import { bannerFallbackImage, bannerImage, features, productFilmId, specs, storyCards } from './data/landingData.js'

const Features = lazy(() => import('./components/Features.jsx'))
const Footer = lazy(() => import('./components/Footer.jsx'))
const ProductFilm = lazy(() => import('./components/ProductFilm.jsx'))
const ProofRow = lazy(() => import('./components/ProofRow.jsx'))
const Signup = lazy(() => import('./components/Signup.jsx'))
const Specs = lazy(() => import('./components/Specs.jsx'))
const Story = lazy(() => import('./components/Story.jsx'))

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

function App() {
  const [theme, setTheme] = useState('dark')
  const [toast, setToast] = useState('Scroll to explore the story.')
  const [form, setForm] = useState({ name: '', email: '' })
  const [formState, setFormState] = useState({ type: 'idle', message: '' })
  const [hasTrackedScroll, setHasTrackedScroll] = useState(false)
  const year = useMemo(() => new Date().getFullYear(), [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

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

  useEffect(() => {
    const onScroll = () => {
      if (!hasTrackedScroll && window.scrollY > 180) {
        setHasTrackedScroll(true)
        setToast('Scroll tracked: story section entered.')
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasTrackedScroll])

  const trackClick = (label) => {
    setToast(`Click tracked: ${label}`)
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const submitForm = async (event) => {
    event.preventDefault()
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

    if (form.name.trim().length < 2) {
      setFormState({ type: 'error', message: 'Please enter your full name.' })
      return
    }

    if (!emailIsValid) {
      setFormState({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setFormState({ type: 'loading', message: 'Sending secure request...' })
    trackClick('newsletter form')

    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL
    const payload = {
      ...form,
      source: 'Nova X Pro landing page',
      submittedAt: new Date().toISOString(),
    }

    try {
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 650)
        })
      }

      setFormState({
        type: 'success',
        message: webhookUrl
          ? 'Thanks. Your request was sent to the webhook.'
          : 'Thanks. Demo validation passed. Add VITE_WEBHOOK_URL to send data.',
      })
      setForm({ name: '', email: '' })
    } catch {
      setFormState({ type: 'error', message: 'Webhook failed. Please try again in a moment.' })
    }
  }

  return (
    <main className="app-shell">
      <Toast message={toast} />
      <Header theme={theme} onToggleTheme={toggleTheme} onTrackClick={trackClick} />
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
    </main>
  )
}

export default App
