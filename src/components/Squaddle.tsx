'use client'

import { useState, useEffect, useCallback } from 'react'
import { Player, GameState, CLUE_ORDER, CLUE_LABELS, CLUE_COSTS } from '@/lib/types'
import {
  getTodayString,
  checkGuess,
  calculateRoundScore,
  getStarRating,
  generateShareText,
  initializeGameState,
  saveGameState,
  loadGameState,
  hasSeenOnboarding,
  markOnboardingSeen,
  getDayNumber,
  getTimeUntilMidnight,
  formatCountdown,
  loadStreakData,
  saveStreakData,
  addScoreToHistory,
  getAverageScore,
  getGamesPlayed,
} from '@/lib/game-utils'

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Welcome to Squaddle!',
      content:
        'Guess the mystery footballer using scouting clues. Can you identify all three players?',
      icon: '⚽',
    },
    {
      title: 'How to Play',
      content:
        'You start with one clue revealed. Read it carefully and try to guess the player. Type your answer and press Enter or tap the checkmark.',
      icon: '🎯',
    },
    {
      title: 'Need More Clues?',
      content:
        "Stuck? Click the highlighted 'Next Clue' button to reveal another hint. But be careful - each clue costs you points!",
      icon: '💡',
    },
    {
      title: 'Scoring',
      content:
        'Start with 100 points per round. Revealing clues and wrong guesses reduce your score. Try to guess with as few clues as possible!',
      icon: '🏆',
    },
    {
      title: 'Three Rounds',
      content:
        'Play through Easy, Medium, and Hard rounds. Each day features new players. Come back tomorrow for a fresh challenge!',
      icon: '📅',
    },
  ]

  const currentStep = steps[step]
  const isLastStep = step === steps.length - 1

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="text-center">
          <div className="text-5xl mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-bold mb-3">{currentStep.title}</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{currentStep.content}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === step ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (isLastStep) {
                markOnboardingSeen()
                onClose()
              } else {
                setStep(step + 1)
              }
            }}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            {isLastStep ? "Let's Play!" : 'Next'}
          </button>
        </div>

        {!isLastStep && (
          <button
            onClick={() => {
              markOnboardingSeen()
              onClose()
            }}
            className="w-full mt-3 py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Skip tutorial
          </button>
        )}
      </div>
    </div>
  )
}

function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full border border-gray-600 hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      title="How to play"
    >
      ?
    </button>
  )
}

export default function Squaddle() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [dailyPlayers, setDailyPlayers] = useState<Player[]>([])
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [dayNum, setDayNum] = useState(1)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timeUntilNext, setTimeUntilNext] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [gamesPlayed, setGamesPlayed] = useState(0)

  // Initialize game on mount
  useEffect(() => {
    const today = getTodayString()
    setDayNum(getDayNumber())

    // Fetch players from API with client's local date
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`/api/games/squaddle?date=${today}`)
        if (res.ok) {
          const players = await res.json()
          setDailyPlayers(players)
        } else {
          console.error('Failed to fetch players from API')
        }
      } catch (error) {
        console.error('Error fetching players:', error)
      }
    }
    fetchPlayers()

    // Load streak data
    const streakData = loadStreakData()
    setStreak(streakData.streak)
    setBestStreak(streakData.bestStreak)

    // Load score history data
    const avgScore = getAverageScore()
    const played = getGamesPlayed()
    setAverageScore(avgScore)
    setGamesPlayed(played)

    // Ensure streak stats are consistent with games played
    // Best streak can't exceed total games played
    if (streakData.bestStreak > played && played > 0) {
      const correctedBestStreak = Math.min(streakData.bestStreak, played)
      const correctedStreak = Math.min(streakData.streak, played)
      setBestStreak(correctedBestStreak)
      setStreak(correctedStreak)
      saveStreakData({
        ...streakData,
        bestStreak: correctedBestStreak,
        streak: correctedStreak,
      })
    }

    const saved = loadGameState()
    if (saved) {
      setGameState(saved)
    } else {
      setGameState(initializeGameState(today))
    }

    // Show onboarding for first-time players
    if (!hasSeenOnboarding()) {
      setShowOnboarding(true)
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    setTimeUntilNext(getTimeUntilMidnight())
    const interval = setInterval(() => {
      setTimeUntilNext(getTimeUntilMidnight())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Save game state on changes
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState)
    }
  }, [gameState])

  // Update streak and save score when game completes
  useEffect(() => {
    if (!gameState?.gameComplete) return

    const streakData = loadStreakData()
    const allRoundsWon = gameState.rounds.every((r) => r.won)
    const wasPlayedYesterday = streakData.lastPlayedDay === dayNum - 1

    let newStreak = streak
    if (allRoundsWon) {
      newStreak = wasPlayedYesterday || streakData.lastPlayedDay === 0 ? streak + 1 : 1
    } else {
      newStreak = 0
    }

    const newBestStreak = Math.max(bestStreak, newStreak)
    setStreak(newStreak)
    setBestStreak(newBestStreak)

    saveStreakData({
      lastPlayedDay: dayNum,
      streak: newStreak,
      bestStreak: newBestStreak,
    })

    // Save score to history and update average
    addScoreToHistory(dayNum, gameState.totalScore, gameState.date)
    setAverageScore(getAverageScore())
    setGamesPlayed(getGamesPlayed())
  }, [
    gameState?.gameComplete,
    gameState?.rounds,
    gameState?.totalScore,
    gameState?.date,
    dayNum,
    streak,
    bestStreak,
  ])

  const currentRound = gameState?.rounds[gameState.currentRound]
  const currentPlayer = dailyPlayers[gameState?.currentRound ?? 0]

  const handleRevealClue = useCallback(() => {
    if (!gameState || !currentRound || currentRound.revealedClues >= 6) return

    setGameState((prev) => {
      if (!prev) return prev
      const newRounds = [...prev.rounds]
      newRounds[prev.currentRound] = {
        ...newRounds[prev.currentRound],
        revealedClues: newRounds[prev.currentRound].revealedClues + 1,
      }
      return { ...prev, rounds: newRounds }
    })
  }, [gameState, currentRound])

  const handleGuess = useCallback(() => {
    if (!gameState || !currentRound || !currentPlayer || !guess.trim()) return

    const isCorrect = checkGuess(guess, currentPlayer)

    if (isCorrect) {
      setGameState((prev) => {
        if (!prev) return prev
        const newRounds = [...prev.rounds]
        const round = newRounds[prev.currentRound]

        const score = calculateRoundScore(round.revealedClues, round.guesses.length, true)
        newRounds[prev.currentRound] = {
          ...round,
          guesses: [...round.guesses, guess],
          completed: true,
          won: true,
          score,
        }

        const newTotalScore = newRounds.reduce((sum, r) => sum + r.score, 0)
        const isLastRound = prev.currentRound === 2

        return {
          ...prev,
          rounds: newRounds,
          totalScore: newTotalScore,
          gameComplete: isLastRound,
        }
      })

      setFeedback('Correct!')
      setGuess('')
    } else {
      setGameState((prev) => {
        if (!prev) return prev
        const newRounds = [...prev.rounds]
        const round = newRounds[prev.currentRound]
        newRounds[prev.currentRound] = {
          ...round,
          guesses: [...round.guesses, guess],
        }
        return { ...prev, rounds: newRounds }
      })

      setFeedback('Wrong! Try again.')
      setGuess('')
    }

    setTimeout(() => setFeedback(null), 1500)
  }, [gameState, currentRound, currentPlayer, guess])

  const handleGiveUp = useCallback(() => {
    if (!gameState || !currentRound) return

    setGameState((prev) => {
      if (!prev) return prev
      const newRounds = [...prev.rounds]
      newRounds[prev.currentRound] = {
        ...newRounds[prev.currentRound],
        completed: true,
        won: false,
        score: 0,
      }

      const newTotalScore = newRounds.reduce((sum, r) => sum + r.score, 0)
      const isLastRound = prev.currentRound === 2

      return {
        ...prev,
        rounds: newRounds,
        totalScore: newTotalScore,
        gameComplete: isLastRound,
      }
    })

    setGuess('')
    setFeedback(`The answer was: ${currentPlayer?.name}`)
    setTimeout(() => setFeedback(null), 3000)
  }, [gameState, currentRound, currentPlayer])

  const handleShare = useCallback(async () => {
    if (!gameState) return

    const baseUrl = window.location.origin
    const text = generateShareText(gameState, dayNum, baseUrl)

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(text)
    }
  }, [gameState, dayNum])

  const handleNextRound = useCallback(() => {
    if (!gameState || gameState.currentRound >= 2) return

    setGameState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        currentRound: prev.currentRound + 1,
      }
    })
    setGuess('')
    setFeedback(null)
  }, [gameState])

  if (!gameState || !currentPlayer || !currentRound) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl animate-pulse">Loading...</div>
      </div>
    )
  }

  const difficultyLabels = ['Easy', 'Medium', 'Hard']
  const _difficultyColors = ['text-green-400', 'text-yellow-400', 'text-red-400']
  const difficultyBgColors = ['bg-green-600', 'bg-yellow-600', 'bg-red-600']

  // Game Complete Screen
  if (gameState.gameComplete) {
    const stars = getStarRating(gameState.totalScore)

    return (
      <div className="max-w-xl mx-auto p-6">
        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold tracking-widest">SQUADDLE</h1>
          <p className="text-gray-500 mt-1">#{dayNum}</p>
        </div>
        <HelpButton onClick={() => setShowOnboarding(true)} />

        <div className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700">
          <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Game Complete!</p>
          <div className="text-5xl mb-4">
            {'⭐'.repeat(stars)}
            {'☆'.repeat(5 - stars)}
          </div>
          <div className="text-5xl font-bold mb-1">{gameState.totalScore}</div>
          <p className="text-gray-400">out of 300 points</p>
        </div>

        <div className="space-y-3 mb-8">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Round Summary</p>
          {gameState.rounds.map((round, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                round.won ? 'bg-gray-900 border-gray-700' : 'bg-gray-900/50 border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${difficultyBgColors[idx]}`}>
                  {difficultyLabels[idx]}
                </span>
                <span className={round.won ? 'text-white' : 'text-gray-500'}>
                  {dailyPlayers[idx]?.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">{round.won ? '✅' : '❌'}</span>
                <span
                  className={`font-mono font-bold ${round.won ? 'text-green-400' : 'text-gray-500'}`}
                >
                  {round.score}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleShare}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <span>✓</span> Copied to Clipboard!
            </>
          ) : (
            <>
              <span>📤</span> Share Results
            </>
          )}
        </button>

        {/* Stats */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <div className="text-center px-4 py-3 rounded-xl bg-gray-800 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{streak}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Streak</div>
          </div>
          <div className="text-center px-4 py-3 rounded-xl bg-gray-800 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{bestStreak}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Best</div>
          </div>
          <div className="text-center px-4 py-3 rounded-xl bg-gray-800 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{averageScore}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Avg Score</div>
          </div>
          <div className="text-center px-4 py-3 rounded-xl bg-gray-800 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{gamesPlayed}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Played</div>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-300 mb-1">Next puzzle in</p>
          <p className="text-2xl font-light font-mono text-white">
            {formatCountdown(timeUntilNext)}
          </p>
        </div>
      </div>
    )
  }

  // Round Complete Screen (not last round)
  if (currentRound.completed && gameState.currentRound < 2) {
    return (
      <div className="max-w-xl mx-auto p-6">
        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold tracking-widest">SQUADDLE</h1>
          <p className="text-gray-500 mt-1">#{dayNum}</p>
        </div>
        <HelpButton onClick={() => setShowOnboarding(true)} />
        <p className="text-gray-400 text-center mb-8">Round {gameState.currentRound + 1} of 3</p>

        <div
          className={`text-center mb-8 p-8 rounded-2xl border ${
            currentRound.won
              ? 'bg-gradient-to-b from-green-900/30 to-gray-900 border-green-800'
              : 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700'
          }`}
        >
          <div className="text-5xl mb-4">{currentRound.won ? '🎉' : '😢'}</div>
          <h2 className="text-2xl font-bold mb-2">
            {currentRound.won ? 'Correct!' : 'Not this time'}
          </h2>
          <p className="text-gray-400 mb-1">The answer was:</p>
          <p className="text-2xl font-bold mb-4">{currentPlayer.name}</p>
          <div
            className={`inline-block px-4 py-2 rounded-lg ${
              currentRound.won ? 'bg-green-900/50' : 'bg-gray-800'
            }`}
          >
            <span className="text-3xl font-bold">{currentRound.score}</span>
            <span className="text-gray-400 ml-1">pts</span>
          </div>
        </div>

        <button
          onClick={handleNextRound}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg transition-colors"
        >
          Next Round: {difficultyLabels[gameState.currentRound + 1]} →
        </button>
      </div>
    )
  }

  // Active Game Screen
  const potentialScore = calculateRoundScore(
    currentRound.revealedClues,
    currentRound.guesses.length,
    true
  )

  return (
    <div className="max-w-xl mx-auto p-6">
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <div className="text-center mb-2">
        <h1 className="text-4xl font-bold tracking-widest">SQUADDLE</h1>
        <p className="text-gray-500 mt-1">#{dayNum}</p>
      </div>
      <HelpButton onClick={() => setShowOnboarding(true)} />

      {/* Round indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              idx === gameState.currentRound
                ? `${difficultyBgColors[idx]} scale-110`
                : idx < gameState.currentRound
                  ? 'bg-green-800 text-green-200'
                  : 'bg-gray-800 text-gray-500'
            }`}
          >
            {idx < gameState.currentRound && '✓ '}
            {difficultyLabels[idx]}
          </div>
        ))}
      </div>

      {/* Score display */}
      <div className="text-center mb-6 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
        <p className="text-gray-400 text-sm mb-1">Points Available</p>
        <span className="text-3xl font-bold text-white">{potentialScore}</span>
        <span className="text-gray-500 text-lg"> / 100</span>
      </div>

      {/* Clues */}
      <div className="space-y-2 mb-6">
        {CLUE_ORDER.map((clueKey, idx) => {
          const isRevealed = idx < currentRound.revealedClues
          const isNextClue = idx === currentRound.revealedClues
          const _isLocked = idx > currentRound.revealedClues
          const clueValue = currentPlayer.clues[clueKey]

          // Revealed clue
          if (isRevealed) {
            return (
              <div key={clueKey} className="p-4 rounded-xl bg-gray-900 border border-gray-700">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    {CLUE_LABELS[clueKey]}
                  </span>
                  <span className="text-xs text-green-500">Revealed</span>
                </div>
                <p className="text-white leading-relaxed">{clueValue}</p>
              </div>
            )
          }

          // Next available clue (clickable)
          if (isNextClue) {
            return (
              <button
                key={clueKey}
                onClick={handleRevealClue}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-900/50 to-blue-800/30 border-2 border-blue-500 hover:border-blue-400 transition-all text-left group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                      Next Clue: {CLUE_LABELS[clueKey]}
                    </span>
                    <p className="text-blue-300 mt-1 group-hover:text-blue-200">Tap to reveal</p>
                  </div>
                  <div className="text-right">
                    <span className="text-yellow-400 font-bold">-{CLUE_COSTS[idx]} pts</span>
                  </div>
                </div>
              </button>
            )
          }

          // Locked clue
          return (
            <div
              key={clueKey}
              className="p-4 rounded-xl bg-gray-900/30 border border-gray-800 opacity-50"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  🔒 {CLUE_LABELS[clueKey]}
                </span>
                <span className="text-xs text-gray-600">-{CLUE_COSTS[idx]} pts</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-center py-3 mb-4 rounded-xl font-medium ${
            feedback.startsWith('Correct')
              ? 'bg-green-900/50 text-green-400 border border-green-800'
              : feedback.startsWith('Wrong')
                ? 'bg-red-900/50 text-red-400 border border-red-800'
                : 'bg-gray-800 text-gray-300 border border-gray-700'
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Guess input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          placeholder="Enter player name..."
          className="flex-1 px-4 py-4 bg-gray-900 border-2 border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-lg transition-colors text-white placeholder-gray-500"
          autoComplete="off"
          autoCapitalize="off"
        />
        <button
          onClick={handleGuess}
          disabled={!guess.trim()}
          className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-colors"
        >
          ✓
        </button>
      </div>

      {/* Wrong guesses */}
      {currentRound.guesses.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-900/50">
          <p className="text-sm text-red-400">
            <span className="font-medium">Wrong guesses:</span> {currentRound.guesses.join(', ')}
            <span className="text-red-500 ml-2">(-{currentRound.guesses.length * 10} pts)</span>
          </p>
        </div>
      )}

      {/* Give up button */}
      <button
        onClick={handleGiveUp}
        className="w-full py-3 text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 rounded-lg text-sm transition-colors"
      >
        Give Up
      </button>
    </div>
  )
}
