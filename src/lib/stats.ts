// Stats utilities for aggregating data across all games

export interface SquaddleStats {
  gamesPlayed: number
  averageScore: number
  bestScore: number
  currentStreak: number
  bestStreak: number
  lastPlayed: string | null
  recentScores: { dayNum: number; score: number; date: string }[]
}

export interface OutliersStats {
  gamesPlayed: number
  perfectGames: number
  currentStreak: number
  bestStreak: number
  lastPlayed: number | null
  winRate: number
}

export interface SimonStats {
  gamesPlayed: number
  averageScore: number
  bestScore: number
  bestStreak: number
  recentGames: { dayNumber: number; totalScore: number; highestStreak: number }[]
}

export interface AllStats {
  squaddle: SquaddleStats
  outliers: OutliersStats
  simon: SimonStats
  totalGamesPlayed: number
  overallStreak: number
}

// Load Squaddle stats
export function loadSquaddleStats(): SquaddleStats {
  if (typeof window === 'undefined') {
    return {
      gamesPlayed: 0,
      averageScore: 0,
      bestScore: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayed: null,
      recentScores: [],
    }
  }

  // Load streak data
  const streakData = localStorage.getItem('squaddle-streak')
  let currentStreak = 0
  let bestStreak = 0
  if (streakData) {
    try {
      const parsed = JSON.parse(streakData)
      currentStreak = parsed.streak || 0
      bestStreak = parsed.bestStreak || 0
    } catch {
      // Ignore
    }
  }

  // Load score history
  const historyData = localStorage.getItem('squaddle-score-history')
  let scores: { dayNum: number; score: number; date: string }[] = []
  if (historyData) {
    try {
      const parsed = JSON.parse(historyData)
      scores = parsed.scores || []
    } catch {
      // Ignore
    }
  }

  const gamesPlayed = scores.length
  const averageScore =
    gamesPlayed > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / gamesPlayed) : 0
  const bestScore = gamesPlayed > 0 ? Math.max(...scores.map((s) => s.score)) : 0
  const lastPlayed = scores.length > 0 ? scores[scores.length - 1].date : null
  const recentScores = scores.slice(-10).reverse()

  return {
    gamesPlayed,
    averageScore,
    bestScore,
    currentStreak,
    bestStreak,
    lastPlayed,
    recentScores,
  }
}

// Load Outliers stats
export function loadOutliersStats(): OutliersStats {
  if (typeof window === 'undefined') {
    return {
      gamesPlayed: 0,
      perfectGames: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayed: null,
      winRate: 0,
    }
  }

  const data = localStorage.getItem('outlier_data')
  if (!data) {
    return {
      gamesPlayed: 0,
      perfectGames: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayed: null,
      winRate: 0,
    }
  }

  try {
    const parsed = JSON.parse(data)
    // Outliers doesn't store history, just current state
    // We'll estimate games played from lastPlayedDay
    const gamesPlayed = parsed.lastPlayedDay ? 1 : 0 // Can only track if played today
    const perfectGames = parsed.lastGameState === 'won' ? 1 : 0
    const currentStreak = parsed.streak || 0
    const bestStreak = parsed.bestStreak || 0
    const lastPlayed = parsed.lastPlayedDay || null
    const winRate = gamesPlayed > 0 ? Math.round((perfectGames / gamesPlayed) * 100) : 0

    return {
      gamesPlayed,
      perfectGames,
      currentStreak,
      bestStreak,
      lastPlayed,
      winRate,
    }
  } catch {
    return {
      gamesPlayed: 0,
      perfectGames: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayed: null,
      winRate: 0,
    }
  }
}

// Load Simon stats
export function loadSimonStats(): SimonStats {
  if (typeof window === 'undefined') {
    return {
      gamesPlayed: 0,
      averageScore: 0,
      bestScore: 0,
      bestStreak: 0,
      recentGames: [],
    }
  }

  // Simon stores each day separately as simon-{dayNumber}
  // We need to iterate through localStorage to find all Simon entries
  const simonGames: { dayNumber: number; totalScore: number; highestStreak: number }[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('simon-')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '')
        if (data.dayNumber && data.totalScore !== undefined) {
          simonGames.push({
            dayNumber: data.dayNumber,
            totalScore: data.totalScore,
            highestStreak: data.highestStreak || 0,
          })
        }
      } catch {
        // Ignore invalid entries
      }
    }
  }

  // Sort by day number
  simonGames.sort((a, b) => a.dayNumber - b.dayNumber)

  const gamesPlayed = simonGames.length
  const averageScore =
    gamesPlayed > 0
      ? Math.round(simonGames.reduce((sum, g) => sum + g.totalScore, 0) / gamesPlayed)
      : 0
  const bestScore = gamesPlayed > 0 ? Math.max(...simonGames.map((g) => g.totalScore)) : 0
  const bestStreak = gamesPlayed > 0 ? Math.max(...simonGames.map((g) => g.highestStreak)) : 0
  const recentGames = simonGames.slice(-10).reverse()

  return {
    gamesPlayed,
    averageScore,
    bestScore,
    bestStreak,
    recentGames,
  }
}

// Load all stats
export function loadAllStats(): AllStats {
  const squaddle = loadSquaddleStats()
  const outliers = loadOutliersStats()
  const simon = loadSimonStats()

  return {
    squaddle,
    outliers,
    simon,
    totalGamesPlayed: squaddle.gamesPlayed + outliers.gamesPlayed + simon.gamesPlayed,
    overallStreak: Math.max(squaddle.currentStreak, outliers.currentStreak),
  }
}
