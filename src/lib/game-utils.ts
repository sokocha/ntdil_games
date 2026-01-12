import { Player, GameState, CLUE_COSTS, WRONG_GUESS_PENALTY, MAX_SCORE_PER_ROUND } from './types'

// Seeded random number generator for daily consistency
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

// Get today's date string in YYYY-MM-DD format (local time)
export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Squaddle launch date - used for puzzle numbering
const SQUADDLE_START_DATE = '2026-01-09'

// Get day number since launch (1-indexed)
export function getDayNumber(): number {
  const start = new Date(SQUADDLE_START_DATE).setHours(0, 0, 0, 0)
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
}

// Get milliseconds until midnight local time
export function getTimeUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

// Format milliseconds as HH:MM:SS
export function formatCountdown(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Convert date string to numeric seed
function dateToSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, part) => acc * 100 + parseInt(part), 0)
}

// Shuffle array with seeded random
function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Get daily players (one per difficulty)
export function getDailyPlayers(players: Player[], dateStr: string): Player[] {
  const seed = dateToSeed(dateStr)
  const random = seededRandom(seed)

  const easy = players.filter((p) => p.difficulty === 'easy')
  const medium = players.filter((p) => p.difficulty === 'medium')
  const hard = players.filter((p) => p.difficulty === 'hard')

  const shuffledEasy = shuffleWithSeed(easy, random)
  const shuffledMedium = shuffleWithSeed(medium, random)
  const shuffledHard = shuffleWithSeed(hard, random)

  return [
    shuffledEasy[0] || easy[0],
    shuffledMedium[0] || medium[0],
    shuffledHard[0] || hard[0],
  ].filter(Boolean)
}

// Check if guess is correct
export function checkGuess(guess: string, player: Player): boolean {
  const normalizedGuess = guess.toLowerCase().trim()
  return player.acceptedAnswers.some((answer) => answer.toLowerCase() === normalizedGuess)
}

// Calculate score for a round
export function calculateRoundScore(
  revealedClues: number,
  wrongGuesses: number,
  won: boolean
): number {
  if (!won) return 0

  const cluePenalty = CLUE_COSTS[revealedClues - 1]
  const guessPenalty = wrongGuesses * WRONG_GUESS_PENALTY

  return Math.max(0, MAX_SCORE_PER_ROUND - cluePenalty - guessPenalty)
}

// Get star rating based on total score
export function getStarRating(totalScore: number): number {
  if (totalScore >= 270) return 5
  if (totalScore >= 210) return 4
  if (totalScore >= 150) return 3
  if (totalScore >= 90) return 2
  if (totalScore > 0) return 1
  return 0
}

// Initialize game state
export function initializeGameState(dateStr: string): GameState {
  return {
    rounds: [
      { playerIndex: 0, revealedClues: 1, guesses: [], score: 0, completed: false, won: false },
      { playerIndex: 1, revealedClues: 1, guesses: [], score: 0, completed: false, won: false },
      { playerIndex: 2, revealedClues: 1, guesses: [], score: 0, completed: false, won: false },
    ],
    currentRound: 0,
    totalScore: 0,
    gameComplete: false,
    date: dateStr,
  }
}

// Generate share text
export function generateShareText(gameState: GameState, dayNum: number, baseUrl: string): string {
  const stars = getStarRating(gameState.totalScore)
  const starEmoji = '⭐'.repeat(stars) + '☆'.repeat(5 - stars)

  const roundEmojis = gameState.rounds.map((round) => {
    if (!round.won) return '❌'
    if (round.revealedClues === 1 && round.guesses.length === 1) return '🟢'
    if (round.revealedClues <= 3) return '🟡'
    return '🟠'
  })

  return `SQUADDLE #${dayNum}
${starEmoji}
Score: ${gameState.totalScore}/300

${roundEmojis.join(' ')}

Play at: ${baseUrl}/squaddle`
}

// Local storage helpers
const STORAGE_KEY = 'squaddle-game-state'
const ONBOARDING_KEY = 'squaddle-onboarding-seen'

export function saveGameState(state: GameState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null

  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null

  try {
    const state = JSON.parse(saved) as GameState
    // Only return if it's today's game
    if (state.date === getTodayString()) {
      return state
    }
    return null
  } catch {
    return null
  }
}

export function hasSeenOnboarding(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function markOnboardingSeen(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ONBOARDING_KEY, 'true')
  }
}

// Streak storage
const STREAK_KEY = 'squaddle-streak'

export interface StreakData {
  lastPlayedDay: number
  streak: number
  bestStreak: number
}

export function loadStreakData(): StreakData {
  if (typeof window === 'undefined') return { lastPlayedDay: 0, streak: 0, bestStreak: 0 }

  const saved = localStorage.getItem(STREAK_KEY)
  if (!saved) return { lastPlayedDay: 0, streak: 0, bestStreak: 0 }

  try {
    return JSON.parse(saved) as StreakData
  } catch {
    return { lastPlayedDay: 0, streak: 0, bestStreak: 0 }
  }
}

export function saveStreakData(data: StreakData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data))
  }
}
