export default function OptimizedImage({
  alt,
  className,
  fallbackSrc,
  height,
  loading = 'lazy',
  priority = false,
  sizes,
  src,
  width,
}) {
  return (
    <picture className={`${className || ''}-picture`}>
      <source srcSet={src} type="image/webp" sizes={sizes} />
      <img
        className={className}
        src={fallbackSrc || src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  )
}
