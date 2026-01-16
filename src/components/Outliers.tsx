'use client'

import { useState, useEffect } from 'react'
import { unlockAudio, feedbackCorrect, feedbackWrong, feedbackGameComplete } from '@/lib/feedback'
import { trackGamePlay } from '@/lib/analytics'
import StreakToast from '@/components/StreakToast'

// Type definitions
interface GameData {
  dayNumber?: number
  currentRound?: number
  roundResults?: boolean[]
  gameComplete?: boolean
  selections?: string[][]
  revealed?: boolean[]
  streak?: number
  bestStreak?: number
  lastPlayedDay?: number
  lastResults?: boolean[]
  lastGameState?: string
}

const getTimeUntilMidnight = (): number => {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

// Get today's date string in YYYY-MM-DD format (local timezone)
const getTodayString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// LocalStorage helpers
const STORAGE_KEY = 'outlier_data'

const loadGameData = (): GameData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

const saveGameData = (data: GameData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore localStorage errors
  }
}

// Note: Categories are now loaded from the database API
// Static data has been removed - use /api/games/outliers endpoint

interface GeneratedRound {
  items: string[]
  outlierIndex: number
  connection: string
  difficulty: string
}

interface GeneratedPuzzle {
  dayNum: number
  rounds: GeneratedRound[]
}

// Difficulty display helpers
const difficultyLabels: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const difficultyColors: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
}

export default function Outlier() {
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [roundResults, setRoundResults] = useState<boolean[]>([])
  const [gameState, setGameState] = useState<string>('playing')
  const [showRules, setShowRules] = useState(false)
  const [timeUntilNext, setTimeUntilNext] = useState(getTimeUntilMidnight())
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [showingAnswer, setShowingAnswer] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStreakToast, setShowStreakToast] = useState(false)
  const [streakToastData, setStreakToastData] = useState({
    streak: 0,
    bestStreak: 0,
    isNewBest: false,
  })

  useEffect(() => {
    // Fetch puzzle from API with client's local date
    const fetchPuzzle = async () => {
      const today = getTodayString()
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/games/outliers?date=${today}`)
        if (res.ok) {
          const data = await res.json()
          setPuzzle(data)

          const saved = loadGameData()
          if (saved) {
            setStreak(saved.streak || 0)
            setBestStreak(saved.bestStreak || 0)

            if (saved.lastPlayedDay === data.dayNum) {
              setAlreadyPlayed(true)
              setRoundResults(saved.lastResults || [])
              setCurrentRound(3)
              setGameState(saved.lastGameState || 'lost')
            } else {
              // Track new game play (only for new games, not already played)
              trackGamePlay('outliers')
            }
          } else {
            // No saved data, this is a new player
            trackGamePlay('outliers')
          }
        } else {
          console.error('Failed to fetch puzzle from API')
          setError('Failed to load puzzle. Please try again later.')
        }
      } catch (err) {
        console.error('Error fetching puzzle:', err)
        setError('Failed to load puzzle. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchPuzzle()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNext(getTimeUntilMidnight())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (index: number) => {
    if (gameState !== 'playing' || showingAnswer || alreadyPlayed) return
    setSelectedIndex(index)
  }

  const handleSubmit = () => {
    if (selectedIndex === null || !puzzle || showingAnswer) return

    // Unlock audio on user interaction (for iOS)
    unlockAudio()

    const round = puzzle.rounds[currentRound]
    const isCorrect = selectedIndex === round.outlierIndex

    // Play sound/haptic feedback
    if (isCorrect) {
      feedbackCorrect()
    } else {
      feedbackWrong()
    }

    // Store the result for this round
    const newResults = [...roundResults, isCorrect]
    setRoundResults(newResults)
    setShowingAnswer(true)
  }

  const handleContinue = () => {
    if (!puzzle) return

    setSelectedIndex(null)
    setShowingAnswer(false)

    if (currentRound < 2) {
      setCurrentRound(currentRound + 1)
    } else {
      // Game over
      const perfectScore = roundResults.every(Boolean)
      const newGameState = perfectScore ? 'won' : 'lost'
      setGameState(newGameState)

      // Play game complete sound
      feedbackGameComplete()

      // Update stats
      const saved = loadGameData() || {}
      const wasPlayedYesterday = saved.lastPlayedDay === puzzle.dayNum - 1

      let newStreak = streak
      if (perfectScore) {
        newStreak = wasPlayedYesterday || saved.lastPlayedDay === undefined ? streak + 1 : 1
      } else {
        newStreak = 0
      }

      const newBestStreak = Math.max(bestStreak, newStreak)
      const isNewBest = newStreak > bestStreak
      setStreak(newStreak)
      setBestStreak(newBestStreak)

      saveGameData({
        lastPlayedDay: puzzle.dayNum,
        lastResults: roundResults,
        lastGameState: newGameState,
        streak: newStreak,
        bestStreak: newBestStreak,
      })

      // Show streak toast
      setStreakToastData({ streak: newStreak, bestStreak: newBestStreak, isNewBest })
      setShowStreakToast(true)
    }
  }

  const generateShareText = () => {
    if (!puzzle) return ''

    let text = `OUTLIER #${puzzle.dayNum}\n`
    text += roundResults.map((r) => (r ? '🟢' : '🔴')).join('') + '\n\n'

    const score = roundResults.filter(Boolean).length
    if (score === 3) {
      text += '🎯 Perfect!'
    } else if (score === 2) {
      text += '👀 So close!'
    } else if (score === 1) {
      text += '🤔 Tricky...'
    } else {
      text += '😅 Tough day'
    }

    const baseUrl = window.location.origin
    text += `\n\nPlay at: ${baseUrl}/outliers`

    return text
  }

  const copyShare = async () => {
    const text = generateShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(text)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</div>
      </div>
    )
  }

  if (error || !puzzle) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>
          {error || 'No puzzle available'}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  const round = puzzle.rounds[currentRound]
  const roundDifficulties = ['easy', 'medium', 'hard']

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        userSelect: 'none',
        color: '#fff',
      }}
    >
      <StreakToast
        streak={streakToastData.streak}
        bestStreak={streakToastData.bestStreak}
        isNewBest={streakToastData.isNewBest}
        show={showStreakToast}
        onClose={() => setShowStreakToast(false)}
      />
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: '700',
            letterSpacing: '6px',
            margin: 0,
            color: '#f9fafb',
          }}
        >
          OUTLIER
        </h1>
        <div
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '4px',
          }}
        >
          #{puzzle.dayNum}
        </div>
      </div>

      {/* Round indicators */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background:
                  roundResults[i] !== undefined
                    ? roundResults[i]
                      ? '#22c55e'
                      : '#ef4444'
                    : i === currentRound && gameState === 'playing'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                border:
                  i === currentRound && gameState === 'playing'
                    ? '2px solid #a78bfa'
                    : '2px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              {roundResults[i] !== undefined ? (roundResults[i] ? '✓' : '✗') : i + 1}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: difficultyColors[roundDifficulties[i]],
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {difficultyLabels[roundDifficulties[i]]}
            </div>
          </div>
        ))}
      </div>

      {/* Game area */}
      {gameState === 'playing' && !alreadyPlayed && (
        <>
          {/* Instructions */}
          <div
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            Tap the <strong>outlier</strong> — the one that doesn't belong
          </div>

          {/* Items */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            {round.items.map((item, i) => {
              const isSelected = selectedIndex === i
              const isOutlier = i === round.outlierIndex
              const showResult = showingAnswer

              let bgColor = 'rgba(255,255,255,0.05)'
              let borderColor = 'rgba(255,255,255,0.1)'

              if (showResult) {
                if (isOutlier) {
                  bgColor = 'rgba(34, 197, 94, 0.2)'
                  borderColor = '#22c55e'
                } else if (isSelected && !isOutlier) {
                  bgColor = 'rgba(239, 68, 68, 0.2)'
                  borderColor = '#ef4444'
                }
              } else if (isSelected) {
                bgColor = 'rgba(99, 102, 241, 0.2)'
                borderColor = '#6366f1'
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showingAnswer}
                  style={{
                    padding: '16px 24px',
                    fontSize: '18px',
                    fontWeight: '500',
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: showingAnswer ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                >
                  {item}
                  {showResult && isOutlier && <span style={{ marginLeft: '8px' }}>← Outlier</span>}
                </button>
              )
            })}
          </div>

          {/* Connection reveal */}
          {showingAnswer && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px 24px',
                background: roundResults[currentRound]
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                border: roundResults[currentRound]
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
                textAlign: 'center',
                maxWidth: '320px',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {roundResults[currentRound] ? '✓ Correct!' : '✗ Wrong'}
              </div>
              <div
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
              >
                Connection
              </div>
              <div style={{ fontSize: '15px', color: '#4ade80' }}>{round.connection}</div>
            </div>
          )}

          {/* Submit button */}
          {!showingAnswer && (
            <button
              onClick={handleSubmit}
              disabled={selectedIndex === null}
              style={{
                padding: '14px 48px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '2px',
                background:
                  selectedIndex !== null
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                color: selectedIndex !== null ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: selectedIndex !== null ? 'pointer' : 'default',
              }}
            >
              LOCK IN
            </button>
          )}

          {/* Continue button */}
          {showingAnswer && (
            <button
              onClick={handleContinue}
              style={{
                padding: '14px 48px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '2px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {currentRound < 2 ? 'NEXT ROUND' : 'SEE RESULTS'}
            </button>
          )}
        </>
      )}

      {/* Game over / Already played */}
      {(gameState !== 'playing' || alreadyPlayed) && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '8px',
              color: roundResults.filter(Boolean).length === 3 ? '#22c55e' : '#f9fafb',
            }}
          >
            {roundResults.filter(Boolean).length === 3
              ? '🎯 Perfect!'
              : roundResults.filter(Boolean).length === 2
                ? '👀 Almost!'
                : roundResults.filter(Boolean).length === 1
                  ? '🤔 Tricky day'
                  : '😅 Rough one'}
          </div>

          <div
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '24px',
            }}
          >
            {roundResults.filter(Boolean).length}/3 correct
          </div>

          {/* Show all rounds */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px',
              maxWidth: '320px',
            }}
          >
            {puzzle.rounds.map((r, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: difficultyColors[r.difficulty] || '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Round {i + 1} • {difficultyLabels[r.difficulty] || r.difficulty}
                  </span>
                  <span>{roundResults[i] ? '✅' : '❌'}</span>
                </div>
                <div
                  style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}
                >
                  {r.connection}
                </div>
                <div style={{ fontSize: '13px', color: '#4ade80' }}>
                  Outlier: <strong>{r.items[r.outlierIndex]}</strong>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={copyShare}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '600',
              background: '#2563eb',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
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
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#a78bfa' }}>{streak}</div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                }}
              >
                Streak
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#a78bfa' }}>
                {bestStreak}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                }}
              >
                Best
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              Next puzzle in
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '300',
                color: '#f9fafb',
                fontFamily: 'monospace',
              }}
            >
              {formatTime(timeUntilNext)}
            </div>
          </div>
        </div>
      )}

      {/* How to play */}
      <button
        onClick={() => setShowRules(!showRules)}
        style={{
          marginTop: '32px',
          padding: '8px 16px',
          fontSize: '11px',
          letterSpacing: '2px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
        }}
      >
        {showRules ? 'HIDE RULES' : 'HOW TO PLAY'}
      </button>

      {showRules && (
        <div
          style={{
            marginTop: '16px',
            maxWidth: '340px',
            fontSize: '14px',
            lineHeight: '1.7',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '12px',
          }}
        >
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Goal:</strong> Find the outlier — the one item that doesn't share the hidden
            connection with the others.
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Rounds:</strong> 3 rounds of increasing difficulty (Easy → Medium → Hard).
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Scoring:</strong> Get all 3 correct for a perfect score and to keep your streak
            alive.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Tip:</strong> Look for what 4 items have in common, not just what seems odd.
          </p>
        </div>
      )}
    </div>
  )
}
