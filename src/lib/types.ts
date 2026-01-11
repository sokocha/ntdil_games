export interface Player {
  id: string
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

export interface RoundState {
  playerIndex: number
  revealedClues: number
  guesses: string[]
  score: number
  completed: boolean
  won: boolean
}

export interface GameState {
  rounds: RoundState[]
  currentRound: number
  totalScore: number
  gameComplete: boolean
  date: string
}

export const CLUE_ORDER = [
  'position',
  'trophies',
  'stats',
  'international',
  'clubs',
  'hint',
] as const

export const CLUE_LABELS: Record<string, string> = {
  position: 'Position',
  trophies: 'Trophies',
  stats: 'Stats',
  international: 'International',
  clubs: 'Clubs',
  hint: 'Hint',
}

export const CLUE_COSTS = [0, 20, 40, 60, 80, 90] as const
export const WRONG_GUESS_PENALTY = 10
export const MAX_SCORE_PER_ROUND = 100
