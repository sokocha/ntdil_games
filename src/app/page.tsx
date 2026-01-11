import Link from 'next/link'

const games = [
  {
    id: 'squaddle',
    name: 'Squaddle',
    description: 'Guess the footballer from scouting clues',
    emoji: '⚽',
    available: true,
  },
  {
    id: 'coming-soon-1',
    name: 'Coming Soon',
    description: 'More games on the way',
    emoji: '🎮',
    available: false,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">NTDIL Games</h1>
          <p className="text-gray-400">Daily games to challenge your brain</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <div key={game.id}>
              {game.available ? (
                <Link
                  href={`/${game.id}`}
                  className="block p-6 rounded-xl border border-gray-800 hover:border-gray-600 hover:bg-gray-900 transition-all"
                >
                  <div className="text-4xl mb-3">{game.emoji}</div>
                  <h2 className="text-xl font-semibold mb-1">{game.name}</h2>
                  <p className="text-gray-400 text-sm">{game.description}</p>
                </Link>
              ) : (
                <div className="block p-6 rounded-xl border border-gray-800 opacity-50 cursor-not-allowed">
                  <div className="text-4xl mb-3">{game.emoji}</div>
                  <h2 className="text-xl font-semibold mb-1">{game.name}</h2>
                  <p className="text-gray-400 text-sm">{game.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
