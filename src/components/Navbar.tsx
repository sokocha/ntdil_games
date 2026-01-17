'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              <span>←</span>
              <span>Back to Games</span>
            </Link>
          )}
          {isHome && <span className="text-sm font-semibold text-white">PlayDay</span>}
        </div>
      </div>
    </nav>
  )
}
