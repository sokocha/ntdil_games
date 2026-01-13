'use client'

import { useState, useEffect, useCallback } from 'react'

interface Player {
  id: number
  playerId: string
  name: string
  acceptedAnswers: string[]
  clues: {
    position: string
    trophies: string
    stats: string
    international: string
    clubs: string
    hint: string
  }
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Category {
  id: number
  difficulty: number
  connection: string
  items: string[]
  outliers: string[]
}

type Tab = 'schedule' | 'players' | 'categories'

interface ScheduleDay {
  date: string
  dayNumber: number
  isToday: boolean
  squaddle: {
    easy: { id: number; playerId: string; name: string } | null
    medium: { id: number; playerId: string; name: string } | null
    hard: { id: number; playerId: string; name: string } | null
  }
  outliers: { id: number; connection: string; difficulty: number } | null
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('schedule')

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // Players state
  const [players, setPlayers] = useState<Player[]>([])
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [showPlayerForm, setShowPlayerForm] = useState(false)

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setToken(password)
    setIsAuthenticated(true)
    setError('')
  }

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/players', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        setIsAuthenticated(false)
        setError('Invalid password')
        return
      }
      const data = await res.json()
      setPlayers(data)
    } catch {
      setError('Failed to fetch players')
    }
    setLoading(false)
  }, [token])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        setIsAuthenticated(false)
        setError('Invalid password')
        return
      }
      const data = await res.json()
      setCategories(data)
    } catch {
      setError('Failed to fetch categories')
    }
    setLoading(false)
  }, [token])

  const fetchSchedule = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/schedule?days=14', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        setIsAuthenticated(false)
        setError('Invalid password')
        return
      }
      const data = await res.json()
      setSchedule(data)
    } catch {
      setError('Failed to fetch schedule')
    }
    setLoading(false)
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPlayers()
      fetchCategories()
      fetchSchedule()
    }
  }, [isAuthenticated, token, fetchPlayers, fetchCategories, fetchSchedule])

  const savePlayer = async (player: Partial<Player>) => {
    setLoading(true)
    try {
      const method = player.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/players', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(player),
      })
      if (res.ok) {
        fetchPlayers()
        setShowPlayerForm(false)
        setEditingPlayer(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save player')
      }
    } catch {
      setError('Failed to save player')
    }
    setLoading(false)
  }

  const deletePlayer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/players?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchPlayers()
      }
    } catch {
      setError('Failed to delete player')
    }
    setLoading(false)
  }

  const saveCategory = async (category: Partial<Category>) => {
    setLoading(true)
    try {
      const method = category.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/categories', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      })
      if (res.ok) {
        fetchCategories()
        setShowCategoryForm(false)
        setEditingCategory(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save category')
      }
    } catch {
      setError('Failed to save category')
    }
    setLoading(false)
  }

  const deleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchCategories()
      }
    } catch {
      setError('Failed to delete category')
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 mb-4"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Game Admin</h1>
          <button
            onClick={() => {
              setIsAuthenticated(false)
              setToken('')
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            {error}
            <button onClick={() => setError('')} className="ml-4 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab('schedule')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'schedule'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setTab('players')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'players'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Squaddle Players ({players.length})
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Outliers Categories ({categories.length})
          </button>
        </div>

        {loading && <p className="text-gray-400 mb-4">Loading...</p>}

        {/* Schedule Tab */}
        {tab === 'schedule' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming 14 Days</h2>
            <div className="space-y-3">
              {schedule.map((day) => (
                <div
                  key={day.date}
                  className={`bg-gray-800 rounded-lg border ${
                    day.isToday ? 'border-blue-500' : 'border-gray-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                    className="w-full p-4 text-left flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold">
                        {day.isToday
                          ? 'Today'
                          : new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                      </span>
                      <span className="text-gray-400 text-sm">#{day.dayNumber}</span>
                      {day.isToday && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400">{expandedDay === day.date ? '▼' : '▶'}</span>
                  </button>

                  {expandedDay === day.date && (
                    <div className="px-4 pb-4 border-t border-gray-700 pt-4">
                      {/* Squaddle Section */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Squaddle Players</h3>
                        <div className="grid gap-2 md:grid-cols-3">
                          {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                            const player = day.squaddle[difficulty]
                            return (
                              <div
                                key={difficulty}
                                className={`p-3 rounded-lg ${
                                  difficulty === 'easy'
                                    ? 'bg-green-900/30 border border-green-700'
                                    : difficulty === 'medium'
                                      ? 'bg-yellow-900/30 border border-yellow-700'
                                      : 'bg-red-900/30 border border-red-700'
                                }`}
                              >
                                <p className="text-gray-400 text-xs uppercase mb-1">{difficulty}</p>
                                {player ? (
                                  <>
                                    <p className="text-white font-semibold">{player.name}</p>
                                    <button
                                      onClick={() => {
                                        const fullPlayer = players.find((p) => p.id === player.id)
                                        if (fullPlayer) {
                                          setEditingPlayer(fullPlayer)
                                          setShowPlayerForm(true)
                                          setTab('players')
                                        }
                                      }}
                                      className="text-blue-400 text-sm hover:underline mt-1"
                                    >
                                      Edit
                                    </button>
                                  </>
                                ) : (
                                  <p className="text-gray-500 italic">No player</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Outliers Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Outliers Category</h3>
                        {day.outliers ? (
                          <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-700">
                            <p className="text-white font-semibold">{day.outliers.connection}</p>
                            <p className="text-gray-400 text-sm">
                              Difficulty:{' '}
                              {day.outliers.difficulty === 1
                                ? 'Easy'
                                : day.outliers.difficulty === 2
                                  ? 'Medium'
                                  : 'Hard'}
                            </p>
                            <button
                              onClick={() => {
                                const fullCategory = categories.find(
                                  (c) => c.id === day.outliers?.id
                                )
                                if (fullCategory) {
                                  setEditingCategory(fullCategory)
                                  setShowCategoryForm(true)
                                  setTab('categories')
                                }
                              }}
                              className="text-blue-400 text-sm hover:underline mt-1"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No category</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {tab === 'players' && (
          <div>
            <button
              onClick={() => {
                setEditingPlayer(null)
                setShowPlayerForm(true)
              }}
              className="mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white"
            >
              + Add Player
            </button>

            {showPlayerForm && (
              <PlayerForm
                player={editingPlayer}
                onSave={savePlayer}
                onCancel={() => {
                  setShowPlayerForm(false)
                  setEditingPlayer(null)
                }}
              />
            )}

            <div className="space-y-4">
              {['easy', 'medium', 'hard'].map((difficulty) => (
                <div key={difficulty}>
                  <h2 className="text-xl font-semibold text-white mb-3 capitalize">{difficulty}</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {players
                      .filter((p) => p.difficulty === difficulty)
                      .map((player) => (
                        <div
                          key={player.id}
                          className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                        >
                          <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                          <p className="text-gray-400 text-sm">ID: {player.playerId}</p>
                          <p className="text-gray-400 text-sm mt-2">{player.clues.position}</p>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => {
                                setEditingPlayer(player)
                                setShowPlayerForm(true)
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePlayer(player.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <div>
            <button
              onClick={() => {
                setEditingCategory(null)
                setShowCategoryForm(true)
              }}
              className="mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white"
            >
              + Add Category
            </button>

            {showCategoryForm && (
              <CategoryForm
                category={editingCategory}
                onSave={saveCategory}
                onCancel={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                }}
              />
            )}

            <div className="space-y-4">
              {[1, 2, 3].map((difficulty) => (
                <div key={difficulty}>
                  <h2 className="text-xl font-semibold text-white mb-3">
                    {difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard'}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categories
                      .filter((c) => c.difficulty === difficulty)
                      .map((category) => (
                        <div
                          key={category.id}
                          className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                        >
                          <h3 className="text-lg font-semibold text-white">
                            {category.connection}
                          </h3>
                          <p className="text-gray-400 text-sm mt-2">
                            Items: {category.items.slice(0, 4).join(', ')}
                            {category.items.length > 4 && ` +${category.items.length - 4} more`}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Outliers: {category.outliers.join(', ')}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => {
                                setEditingCategory(category)
                                setShowCategoryForm(true)
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Player Form Component
function PlayerForm({
  player,
  onSave,
  onCancel,
}: {
  player: Player | null
  onSave: (player: Partial<Player>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    id: player?.id,
    playerId: player?.playerId || '',
    name: player?.name || '',
    acceptedAnswers: player?.acceptedAnswers.join(', ') || '',
    difficulty: player?.difficulty || 'easy',
    position: player?.clues.position || '',
    trophies: player?.clues.trophies || '',
    stats: player?.clues.stats || '',
    international: player?.clues.international || '',
    clubs: player?.clues.clubs || '',
    hint: player?.clues.hint || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: formData.id,
      playerId: formData.playerId,
      name: formData.name,
      acceptedAnswers: formData.acceptedAnswers.split(',').map((s) => s.trim().toLowerCase()),
      difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
      clues: {
        position: formData.position,
        trophies: formData.trophies,
        stats: formData.stats,
        international: formData.international,
        clubs: formData.clubs,
        hint: formData.hint,
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        {player ? 'Edit Player' : 'Add Player'}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Player ID (e.g., ronaldo)"
          value={formData.playerId}
          onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="text"
          placeholder="Accepted Answers (comma-separated)"
          value={formData.acceptedAnswers}
          onChange={(e) => setFormData({ ...formData, acceptedAnswers: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 md:col-span-2"
          required
        />
        <select
          value={formData.difficulty}
          onChange={(e) =>
            setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
          }
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <h4 className="text-lg font-semibold text-white mt-6 mb-3">Clues</h4>
      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="text"
          placeholder="Trophies"
          value={formData.trophies}
          onChange={(e) => setFormData({ ...formData, trophies: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="text"
          placeholder="Stats"
          value={formData.stats}
          onChange={(e) => setFormData({ ...formData, stats: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="text"
          placeholder="International"
          value={formData.international}
          onChange={(e) => setFormData({ ...formData, international: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="text"
          placeholder="Clubs"
          value={formData.clubs}
          onChange={(e) => setFormData({ ...formData, clubs: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="text"
          placeholder="Hint"
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
      </div>
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Category Form Component
function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category: Category | null
  onSave: (category: Partial<Category>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    id: category?.id,
    difficulty: category?.difficulty || 1,
    connection: category?.connection || '',
    items: category?.items.join(', ') || '',
    outliers: category?.outliers.join(', ') || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: formData.id,
      difficulty: formData.difficulty,
      connection: formData.connection,
      items: formData.items.split(',').map((s) => s.trim()),
      outliers: formData.outliers.split(',').map((s) => s.trim()),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        {category ? 'Edit Category' : 'Add Category'}
      </h3>
      <div className="grid gap-4">
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value={1}>Easy</option>
          <option value={2}>Medium</option>
          <option value={3}>Hard</option>
        </select>
        <input
          type="text"
          placeholder="Connection (the hidden theme)"
          value={formData.connection}
          onChange={(e) => setFormData({ ...formData, connection: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          required
        />
        <textarea
          placeholder="Items (comma-separated, at least 4)"
          value={formData.items}
          onChange={(e) => setFormData({ ...formData, items: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 min-h-24"
          required
        />
        <textarea
          placeholder="Outliers (comma-separated, items that DON'T belong)"
          value={formData.outliers}
          onChange={(e) => setFormData({ ...formData, outliers: e.target.value })}
          className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 min-h-24"
          required
        />
      </div>
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
