const apiBase = import.meta.env.VITE_API_BASE_URL || ''

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function readJson(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  return JSON.parse(text)
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const payload = await readJson(response)

  if (!response.ok) {
    throw new ApiError(payload?.message || 'Co loi xay ra.', response.status, payload?.details)
  }

  return payload
}

export function formatPrice(value, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function getProductImage(product) {
  return product?.images?.[0]?.url || '/iphone.webp'
}
