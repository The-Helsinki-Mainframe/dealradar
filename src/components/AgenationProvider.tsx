'use client'

import { useEffect } from 'react'

// We do NOT import agentation via React/Next.js — doing so causes Next.js to
// preload its chunk in the layout <script> tags, which then patches
// window.setTimeout/setInterval/rAF before React hydrates and crashes the app.
// Instead we inject it as a standalone <script> tag after full hydration.
export function AgenationProvider() {
  useEffect(() => {
    // Dynamically load agentation after hydration is fully complete.
    // Using a raw import() (not next/dynamic) keeps it out of Next.js's
    // preload graph so it can't interfere with React's timing.
    import('agentation').then(({ Agentation }) => {
      const container = document.createElement('div')
      container.id = 'agentation-root'
      document.body.appendChild(container)

      import('react-dom/client').then(({ createRoot }) => {
        import('react').then(({ createElement }) => {
          const root = createRoot(container)
          root.render(createElement(Agentation))
        })
      })
    }).catch(() => {
      // Agentation failing to load should never crash the app
    })
  }, [])

  return null
}
