import Squaddle from '@/components/Squaddle'
import Link from 'next/link'

export default function SquaddlePage() {
  return (
    <main className="min-h-screen py-8">
      <div className="max-w-xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          ← Back to Games
        </Link>
      </div>
      <Squaddle />
    </main>
  )
}
