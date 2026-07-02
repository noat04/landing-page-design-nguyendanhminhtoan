import { useMemo, useState } from 'react'

export default function Story({ storyCards }) {
  const initialCenterIndex = Math.min(1, storyCards.length - 1)
  const [activeIndex, setActiveIndex] = useState(initialCenterIndex)
  const positionedCards = useMemo(() => {
    const totalCards = storyCards.length

    return storyCards.map((card, index) => {
      const offset = (index - activeIndex + totalCards) % totalCards
      const position = offset === 0 ? 'center' : offset === totalCards - 1 ? 'left' : 'right'

      return { ...card, index, position }
    })
  }, [activeIndex, storyCards])

  return (
    <section id="story" className="story-section reveal">
      <div className="story-heading">
        <p className="eyebrow center">Designed to inspire</p>
        <h2>Crafted to stand out.</h2>
      </div>

      <div className="story-grid" aria-label="Design story cards">
        {positionedCards.map((card) => (
          <article
            className={`story-card story-card-${card.index + 1} ${card.position}`}
            key={card.title}
            role="button"
            tabIndex={0}
            aria-label={`Show ${card.title}`}
            aria-pressed={activeIndex === card.index}
            onClick={() => setActiveIndex(card.index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setActiveIndex(card.index)
              }
            }}
          >
            <div className="story-shine" />
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <div className="slider-dots" aria-label="Story progress">
        {storyCards.map((card, index) => (
          <button
            className={activeIndex === index ? 'active' : ''}
            type="button"
            key={card.title}
            aria-label={`Show story ${index + 1}`}
            aria-current={activeIndex === index}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}
