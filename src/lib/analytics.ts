// Analytics tracking for unique player identification

const PLAYER_ID_KEY = 'ntdil-unique-player-id'

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Get or create a unique player ID
export function getUniquePlayerId(): string {
  if (typeof window === 'undefined') return ''

  let playerId = localStorage.getItem(PLAYER_ID_KEY)
  if (!playerId) {
    playerId = generateUUID()
    localStorage.setItem(PLAYER_ID_KEY, playerId)
  }
  return playerId
}

// Track a game play - called when a player starts a game session
export async function trackGamePlay(game: 'squaddle' | 'outliers' | 'simon'): Promise<void> {
  const playerId = getUniquePlayerId()
  if (!playerId) return

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, game }),
    })
  } catch (error) {
    // Silently fail - analytics shouldn't break the game
    console.error('Analytics tracking error:', error)
  }
}
