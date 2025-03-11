'use client'

import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    // Handle any client-side initialization here
  }, [])

  // App component is now only used for initialization
  // All routing is handled by Next.js app router
  return null
}