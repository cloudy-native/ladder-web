'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Home from './pages/Home'
import About from './pages/About'

export default function App() {
  const pathname = usePathname()

  useEffect(() => {
    // Handle any client-side initialization here
  }, [])

  // Handle routes
  switch(pathname) {
    case '/about':
      return <About />
    default:
      // Default to Home for root and other unmatched routes
      return <Home />
  }
}