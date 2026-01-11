import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getTodayString,
  getDailyPlayers,
  checkGuess,
  calculateRoundScore,
  getStarRating,
  initializeGameState,
  generateShareText,
} from './game-utils'
import { Player, GameState } from './types'

// Mock player data for testing
const mockPlayers: Player[] = [
  {
    id: 'easy1',
    name: 'Easy Player 1',
    acceptedAnswers: ['easy1', 'easy player 1', 'ep1'],
    clues: {
      position: 'Forward',
      trophies: 'Trophy 1',
      stats: 'Stats 1',
      international: 'Country 1',
      clubs: 'Club 1',
      hint: 'Hint 1',
    },
    difficulty: 'easy',
  },
  {
    id: 'easy2',
    name: 'Easy Player 2',
    acceptedAnswers: ['easy2', 'easy player 2'],
    clues: {
      position: 'Midfielder',
      trophies: 'Trophy 2',
      stats: 'Stats 2',
      international: 'Country 2',
      clubs: 'Club 2',
      hint: 'Hint 2',
    },
    difficulty: 'easy',
  },
  {
    id: 'medium1',
    name: 'Medium Player 1',
    acceptedAnswers: ['medium1', 'medium player 1'],
    clues: {
      position: 'Defender',
      trophies: 'Trophy 3',
      stats: 'Stats 3',
      international: 'Country 3',
      clubs: 'Club 3',
      hint: 'Hint 3',
    },
    difficulty: 'medium',
  },
  {
    id: 'hard1',
    name: 'Hard Player 1',
    acceptedAnswers: ['hard1', 'hard player 1'],
    clues: {
      position: 'Goalkeeper',
      trophies: 'Trophy 4',
      stats: 'Stats 4',
      international: 'Country 4',
      clubs: 'Club 4',
      hint: 'Hint 4',
    },
    difficulty: 'hard',
  },
]

describe('getTodayString', () => {
  it('returns date in YYYY-MM-DD format', () => {
    const result = getTodayString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns a valid date string', () => {
    const result = getTodayString()
    const date = new Date(result)
    expect(date.toString()).not.toBe('Invalid Date')
  })
})

describe('getDailyPlayers', () => {
  it('returns exactly 3 players (one per difficulty)', () => {
    const result = getDailyPlayers(mockPlayers, '2024-01-15')
    expect(result).toHaveLength(3)
  })

  it('returns players in order: easy, medium, hard', () => {
    const result = getDailyPlayers(mockPlayers, '2024-01-15')
    expect(result[0].difficulty).toBe('easy')
    expect(result[1].difficulty).toBe('medium')
    expect(result[2].difficulty).toBe('hard')
  })

  it('returns same players for same date (deterministic)', () => {
    const result1 = getDailyPlayers(mockPlayers, '2024-01-15')
    const result2 = getDailyPlayers(mockPlayers, '2024-01-15')
    expect(result1[0].id).toBe(result2[0].id)
    expect(result1[1].id).toBe(result2[1].id)
    expect(result1[2].id).toBe(result2[2].id)
  })

  it('returns different players for different dates', () => {
    const result1 = getDailyPlayers(mockPlayers, '2024-01-15')
    const result2 = getDailyPlayers(mockPlayers, '2024-01-16')
    // At least one player should be different (or same if only one option per difficulty)
    // Since we have 2 easy players, the easy one should potentially differ
    expect(result1).not.toEqual(result2)
  })
})

describe('checkGuess', () => {
  const player = mockPlayers[0] // Easy Player 1

  it('returns true for exact match', () => {
    expect(checkGuess('easy1', player)).toBe(true)
  })

  it('returns true for case-insensitive match', () => {
    expect(checkGuess('EASY1', player)).toBe(true)
    expect(checkGuess('Easy1', player)).toBe(true)
  })

  it('returns true for match with extra whitespace', () => {
    expect(checkGuess('  easy1  ', player)).toBe(true)
  })

  it('returns true for alternative accepted answers', () => {
    expect(checkGuess('easy player 1', player)).toBe(true)
    expect(checkGuess('ep1', player)).toBe(true)
  })

  it('returns false for incorrect guess', () => {
    expect(checkGuess('wrong answer', player)).toBe(false)
  })

  it('returns false for partial match', () => {
    expect(checkGuess('easy', player)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(checkGuess('', player)).toBe(false)
  })
})

describe('calculateRoundScore', () => {
  it('returns 100 for perfect round (1 clue, 0 wrong guesses)', () => {
    expect(calculateRoundScore(1, 0, true)).toBe(100)
  })

  it('returns 0 if player did not win', () => {
    expect(calculateRoundScore(1, 0, false)).toBe(0)
    expect(calculateRoundScore(6, 10, false)).toBe(0)
  })

  it('deducts points for revealed clues', () => {
    // CLUE_COSTS = [0, 20, 40, 60, 80, 90]
    expect(calculateRoundScore(2, 0, true)).toBe(80) // 100 - 0 - 20 = 80
    expect(calculateRoundScore(3, 0, true)).toBe(40) // 100 - 0 - 20 - 40 = 40
  })

  it('deducts 10 points per wrong guess', () => {
    expect(calculateRoundScore(1, 1, true)).toBe(90) // 100 - 10 = 90
    expect(calculateRoundScore(1, 5, true)).toBe(50) // 100 - 50 = 50
  })

  it('combines clue and guess penalties', () => {
    expect(calculateRoundScore(2, 2, true)).toBe(60) // 100 - 20 - 20 = 60
  })

  it('never returns negative score', () => {
    expect(calculateRoundScore(6, 100, true)).toBe(0)
  })
})

describe('getStarRating', () => {
  it('returns 5 stars for score >= 270', () => {
    expect(getStarRating(270)).toBe(5)
    expect(getStarRating(300)).toBe(5)
  })

  it('returns 4 stars for score >= 210', () => {
    expect(getStarRating(210)).toBe(4)
    expect(getStarRating(269)).toBe(4)
  })

  it('returns 3 stars for score >= 150', () => {
    expect(getStarRating(150)).toBe(3)
    expect(getStarRating(209)).toBe(3)
  })

  it('returns 2 stars for score >= 90', () => {
    expect(getStarRating(90)).toBe(2)
    expect(getStarRating(149)).toBe(2)
  })

  it('returns 1 star for score > 0', () => {
    expect(getStarRating(1)).toBe(1)
    expect(getStarRating(89)).toBe(1)
  })

  it('returns 0 stars for score = 0', () => {
    expect(getStarRating(0)).toBe(0)
  })
})

describe('initializeGameState', () => {
  it('creates game state with correct date', () => {
    const state = initializeGameState('2024-01-15')
    expect(state.date).toBe('2024-01-15')
  })

  it('creates 3 rounds', () => {
    const state = initializeGameState('2024-01-15')
    expect(state.rounds).toHaveLength(3)
  })

  it('initializes all rounds with correct defaults', () => {
    const state = initializeGameState('2024-01-15')
    state.rounds.forEach((round, index) => {
      expect(round.playerIndex).toBe(index)
      expect(round.revealedClues).toBe(1)
      expect(round.guesses).toEqual([])
      expect(round.score).toBe(0)
      expect(round.completed).toBe(false)
      expect(round.won).toBe(false)
    })
  })

  it('starts at round 0', () => {
    const state = initializeGameState('2024-01-15')
    expect(state.currentRound).toBe(0)
  })

  it('starts with 0 total score', () => {
    const state = initializeGameState('2024-01-15')
    expect(state.totalScore).toBe(0)
  })

  it('game is not complete initially', () => {
    const state = initializeGameState('2024-01-15')
    expect(state.gameComplete).toBe(false)
  })
})

describe('generateShareText', () => {
  it('includes the game date', () => {
    const state = initializeGameState('2024-01-15')
    state.totalScore = 100
    const text = generateShareText(state)
    expect(text).toContain('2024-01-15')
  })

  it('includes the score', () => {
    const state = initializeGameState('2024-01-15')
    state.totalScore = 250
    const text = generateShareText(state)
    expect(text).toContain('250/300')
  })

  it('includes correct star rating', () => {
    const state = initializeGameState('2024-01-15')
    state.totalScore = 280 // 5 stars
    const text = generateShareText(state)
    expect(text).toContain('⭐⭐⭐⭐⭐')
  })

  it('shows green emoji for perfect round', () => {
    const state = initializeGameState('2024-01-15')
    state.rounds[0] = { ...state.rounds[0], won: true, revealedClues: 1, guesses: ['correct'] }
    const text = generateShareText(state)
    expect(text).toContain('🟢')
  })

  it('shows red X for lost round', () => {
    const state = initializeGameState('2024-01-15')
    state.rounds[0] = { ...state.rounds[0], won: false }
    const text = generateShareText(state)
    expect(text).toContain('❌')
  })

  it('shows yellow emoji for round with 2-3 clues', () => {
    const state = initializeGameState('2024-01-15')
    state.rounds[0] = {
      ...state.rounds[0],
      won: true,
      revealedClues: 2,
      guesses: ['wrong', 'correct'],
    }
    const text = generateShareText(state)
    expect(text).toContain('🟡')
  })

  it('shows orange emoji for round with 4+ clues', () => {
    const state = initializeGameState('2024-01-15')
    state.rounds[0] = { ...state.rounds[0], won: true, revealedClues: 4, guesses: ['correct'] }
    const text = generateShareText(state)
    expect(text).toContain('🟠')
  })

  it('includes play link', () => {
    const state = initializeGameState('2024-01-15')
    const text = generateShareText(state)
    expect(text).toContain('ntdil.games')
  })
})
