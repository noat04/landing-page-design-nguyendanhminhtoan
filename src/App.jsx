import { useEffect, useMemo, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Features from './components/Features.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ProductFilm from './components/ProductFilm.jsx'
import ProofRow from './components/ProofRow.jsx'
import Signup from './components/Signup.jsx'
import Specs from './components/Specs.jsx'
import Story from './components/Story.jsx'
import Toast from './components/Toast.jsx'
import { bannerFallbackImage, bannerImage, features, productFilmId, specs, storyCards } from './data/landingData.js'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

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
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > *', {
        y: 26,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      })

      gsap.utils.toArray('.reveal').forEach((item) => {
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

      gsap.utils.toArray('.story-card').forEach((card, index) => {
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
    })

    return () => ctx.revert()
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
      <ProductFilm productFilmId={productFilmId} />
      <Features features={features} />
      <Specs specs={specs} />
      <Story storyCards={storyCards} />
      <Signup form={form} formState={formState} onFieldChange={updateField} onSubmit={submitForm} />
      <ProofRow />
      <Footer year={year} />
    </main>
  )
}

export default App
