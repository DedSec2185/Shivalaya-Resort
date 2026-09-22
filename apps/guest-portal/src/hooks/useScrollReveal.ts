import { useEffect, useRef } from 'react'

export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Find the closest scrollable ancestor to use as IntersectionObserver root
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      { threshold, root: null }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}
