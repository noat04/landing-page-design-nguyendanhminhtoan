import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

let stylesLoaded = false

const loadDeferredStyles = () => {
  if (stylesLoaded) {
    return
  }

  stylesLoaded = true
  window.removeEventListener('scroll', loadDeferredStyles)
  window.removeEventListener('pointerdown', loadDeferredStyles)
  window.removeEventListener('keydown', loadDeferredStyles)

  void import('./index.css')
  void import('./App.css')
}

window.addEventListener('scroll', loadDeferredStyles, { once: true, passive: true })
window.addEventListener('pointerdown', loadDeferredStyles, { once: true, passive: true })
window.addEventListener('keydown', loadDeferredStyles, { once: true })

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(loadDeferredStyles, { timeout: 1200 })
} else {
  window.setTimeout(loadDeferredStyles, 0)
}
