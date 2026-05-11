'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Minimum time the spinner stays on screen once shown. Prevents a jarring
// flash on fast routes — a too-brief spinner feels like a flicker.
const MIN_VISIBLE_MS = 500
// Delay before showing the spinner. If navigation finishes within this
// window, we skip the spinner entirely — feels snappier on cached routes.
const SHOW_DELAY_MS = 60

// Body-area spinner that overlays the main content during route transitions.
// Triggers on clicks of internal links (including sidebar + in-page buttons)
// and clears as soon as the new pathname renders (with min visible duration).
export function NavigationLoader() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const showAtRef = useRef<number | null>(null)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  // New pathname rendered — hide the loader, but honor the minimum
  // visible duration so it doesn't flash off the screen.
  useEffect(() => {
    // Cancel any pending show — navigation already completed.
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    if (!isNavigating) return
    const shownAt = showAtRef.current
    const elapsed = shownAt ? Date.now() - shownAt : MIN_VISIBLE_MS
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
    hideTimerRef.current = setTimeout(() => {
      setIsNavigating(false)
      showAtRef.current = null
    }, remaining)
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Respect modifier-clicks / non-primary buttons — they don't trigger
      // SPA navigation, the browser handles them itself.
      // Note: we deliberately do NOT check `event.defaultPrevented` here
      // because Next.js Link calls preventDefault() to do client-side
      // navigation, and we still want the spinner in that case.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip external links, hash links, mailto/tel, downloads, and
      // links that open in a new tab.
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return
      }

      // Same path — no navigation happening.
      const url = new URL(href, window.location.origin)
      if (url.pathname === pathname) return

      // Defer showing so very-fast routes don't flash a spinner at all.
      clearTimers()
      showTimerRef.current = setTimeout(() => {
        showAtRef.current = Date.now()
        setIsNavigating(true)
        showTimerRef.current = null
      }, SHOW_DELAY_MS)
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      clearTimers()
    }
  }, [pathname])

  if (!isNavigating) return null

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-150">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}
