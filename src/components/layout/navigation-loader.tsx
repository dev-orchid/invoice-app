'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Body-area spinner that overlays the main content during route transitions.
// Triggers on clicks of internal links (including sidebar + in-page buttons)
// and clears as soon as the new pathname renders.
export function NavigationLoader() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  // New pathname rendered — hide the loader.
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Respect modifier-clicks / non-primary buttons — they don't trigger
      // SPA navigation, the browser handles them itself.
      if (
        event.defaultPrevented ||
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

      setIsNavigating(true)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  if (!isNavigating) return null

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}
