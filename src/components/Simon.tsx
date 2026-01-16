'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const getDayNumber = (): number => {
  // Use Date constructor with explicit values to avoid UTC parsing issues
  const start = new Date(2026, 0, 10).setHours(0, 0, 0, 0) // Jan 10, 2026
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
}

// Generate sequence for a day
const generateSequence = (seed: number, length: number): number[] => {
  const sequence: number[] = []
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(seededRandom(seed + i * 7) * 4))
  }
  return sequence
}

// Sound frequencies for each color (musical notes)
const FREQUENCIES: Record<number, number> = {
  0: 261.63, // C4 - Green
  1: 329.63, // E4 - Red
  2: 392.0, // G4 - Yellow
  3: 523.25, // C5 - Blue
}

const COLORS = [
  { name: 'green', base: '#22c55e', lit: '#4ade80', dark: '#166534' },
  { name: 'red', base: '#ef4444', lit: '#f87171', dark: '#991b1b' },
  { name: 'yellow', base: '#eab308', lit: '#facc15', dark: '#a16207' },
  { name: 'blue', base: '#3b82f6', lit: '#60a5fa', dark: '#1d4ed8' },
]

type Difficulty = 'easy' | 'medium' | 'hard'
type GameState = 'ready' | 'countdown' | 'playing' | 'gameComplete'

interface SavedState {
  dayNumber: number
  totalScore: number
  roundScores: (number | null)[]
  highestStreak: number
}

interface DifficultySettings {
  start: number
  target: number
  speed: number
}

const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
const difficultyLabels = ['EASY', 'MEDIUM', 'HARD']
const difficultyColors: Record<Difficulty, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
}

// Starting sequence lengths and targets for each difficulty
const difficultySettings: Record<Difficulty, DifficultySettings> = {
  easy: { start: 3, target: 6, speed: 600 },
  medium: { start: 4, target: 8, speed: 500 },
  hard: { start: 5, target: 10, speed: 400 },
}

const Simon = () => {
  const [dayNumber] = useState(getDayNumber())
  const [round, setRound] = useState(0)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [sequenceLength, setSequenceLength] = useState(0)
  const [roundScores, setRoundScores] = useState<(number | null)[]>([null, null, null])
  const [gameState, setGameState] = useState<GameState>('ready')
  const [savedState, setSavedState] = useState<SavedState | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [highestStreak, setHighestStreak] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)

  // eslint-disable-next-line no-undef
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`simon-${dayNumber}`)
    if (saved) {
      const parsed = JSON.parse(saved) as SavedState
      setSavedState(parsed)
      setRoundScores(parsed.roundScores)
      setHighestStreak(parsed.highestStreak)
      setGameState('gameComplete')
    }
  }, [dayNumber])

  // Initialize audio context - must be called synchronously from user gesture
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      /* eslint-disable no-undef */
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      /* eslint-enable no-undef */
      audioContextRef.current = new AudioContextClass()
    }
    return audioContextRef.current
  }, [])

  // Unlock audio for iOS - play silent buffer synchronously on user gesture
  const unlockAudio = useCallback(() => {
    const ctx = initAudio()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    // Play a silent buffer to fully unlock audio on iOS
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)
  }, [initAudio])

  // Play countdown beep sound
  const playCountdownBeep = useCallback(
    (isGo = false) => {
      if (!soundEnabled) return

      try {
        const ctx = initAudio()
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        // Higher pitch for "GO!"
        oscillator.frequency.value = isGo ? 880 : 440
        oscillator.type = 'sine'

        const duration = isGo ? 0.3 : 0.15
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration)
      } catch {
        // Audio not available - fail silently
      }
    },
    [soundEnabled, initAudio]
  )

  // Play a tone for a button
  const playTone = useCallback(
    (buttonIndex: number, duration = 300) => {
      if (!soundEnabled) return

      try {
        const ctx = initAudio()
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.value = FREQUENCIES[buttonIndex]
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration / 1000)
      } catch {
        // Audio not available - fail silently
      }
    },
    [soundEnabled, initAudio]
  )

  // Play error sound
  const playErrorSound = useCallback(() => {
    if (!soundEnabled) return

    try {
      const ctx = initAudio()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 150
      oscillator.type = 'sawtooth'

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch {
      // Audio not available - fail silently
    }
  }, [soundEnabled, initAudio])

  // Play the sequence
  const playSequence = useCallback(
    (seq: number[], speed: number) => {
      setIsPlaying(true)
      setIsPlayerTurn(false)

      let i = 0
      const playNext = () => {
        if (i < seq.length) {
          setActiveButton(seq[i])
          playTone(seq[i], speed * 0.8)

          setTimeout(() => {
            setActiveButton(null)
            i++
            setTimeout(playNext, speed * 0.3)
          }, speed * 0.7)
        } else {
          setIsPlaying(false)
          setIsPlayerTurn(true)
          setMessage('Your turn! Repeat the sequence')
        }
      }

      playNext()
    },
    [playTone]
  )

  // Start a new round
  const startRound = useCallback(
    (roundIndex: number) => {
      const difficulty = difficulties[roundIndex]
      const settings = difficultySettings[difficulty]
      const seed = dayNumber * 99999 + roundIndex * 1000

      const newSequence = generateSequence(seed, settings.target)
      setSequence(newSequence)
      setSequenceLength(settings.start)
      setPlayerSequence([])
      setIsPlayerTurn(false)
      setMessage('Watch the sequence...')

      // Small delay then play sequence
      setTimeout(() => {
        playSequence(newSequence.slice(0, settings.start), settings.speed)
      }, 1000)
    },
    [dayNumber, playSequence]
  )

  // Handle countdown timer
  useEffect(() => {
    if (countdown === null || gameState !== 'countdown') return

    if (countdown > 0) {
      playCountdownBeep(false)
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Countdown finished - play "GO!" beep and start round
      playCountdownBeep(true)
      const timer = setTimeout(() => {
        setCountdown(null)
        setGameState('playing')
        startRound(round)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [countdown, gameState, round, playCountdownBeep, startRound])

  // Handle button press
  const handleButtonPress = useCallback(
    (buttonIndex: number) => {
      if (!isPlayerTurn || isPlaying) return

      // Unlock audio on user interaction for iOS
      unlockAudio()

      setActiveButton(buttonIndex)
      playTone(buttonIndex, 200)

      setTimeout(() => setActiveButton(null), 200)

      const newPlayerSequence = [...playerSequence, buttonIndex]
      setPlayerSequence(newPlayerSequence)

      const currentIndex = newPlayerSequence.length - 1
      const expectedButton = sequence[currentIndex]

      if (buttonIndex !== expectedButton) {
        // Wrong!
        setIsPlayerTurn(false)
        playErrorSound()
        setMessage('Wrong! Game over')

        const difficulty = difficulties[round]
        const settings = difficultySettings[difficulty]
        const reached = sequenceLength - 1
        const target = settings.target

        // Score based on how far they got
        let score: number
        if (reached >= target) {
          score = 100
        } else if (reached >= target - 1) {
          score = 80
        } else if (reached >= target - 2) {
          score = 60
        } else if (reached >= settings.start) {
          score = 40
        } else {
          score = 20
        }

        const newRoundScores = [...roundScores]
        newRoundScores[round] = score
        setRoundScores(newRoundScores)

        if (sequenceLength - 1 > highestStreak) {
          setHighestStreak(sequenceLength - 1)
        }

        setTimeout(() => setShowResult(true), 1500)
      } else if (newPlayerSequence.length === sequenceLength) {
        // Completed current sequence!
        setIsPlayerTurn(false)

        const difficulty = difficulties[round]
        const settings = difficultySettings[difficulty]

        if (sequenceLength >= settings.target) {
          // Beat the round!
          setMessage('Perfect! Round complete!')

          const newRoundScores = [...roundScores]
          newRoundScores[round] = 100
          setRoundScores(newRoundScores)

          if (sequenceLength > highestStreak) {
            setHighestStreak(sequenceLength)
          }

          setTimeout(() => setShowResult(true), 1500)
        } else {
          // Continue to next level
          const newLength = sequenceLength + 1
          setSequenceLength(newLength)
          setPlayerSequence([])
          setMessage(`Great! Next: ${newLength} lights`)

          setTimeout(() => {
            playSequence(sequence.slice(0, newLength), settings.speed)
          }, 1500)
        }
      }
    },
    [
      isPlayerTurn,
      isPlaying,
      playerSequence,
      sequence,
      sequenceLength,
      round,
      roundScores,
      highestStreak,
      playTone,
      playErrorSound,
      playSequence,
      unlockAudio,
    ]
  )

  const handleContinue = () => {
    if (round < 2) {
      setRound(round + 1)
      setShowResult(false)
      setGameState('ready')
    } else {
      const totalScore = roundScores.reduce<number>((a, b) => a + (b || 0), 0)
      const finalState: SavedState = {
        dayNumber,
        totalScore,
        roundScores,
        highestStreak,
      }
      localStorage.setItem(`simon-${dayNumber}`, JSON.stringify(finalState))
      setSavedState(finalState)
      setGameState('gameComplete')
    }
  }

  const handleStart = () => {
    // Must unlock audio synchronously on user gesture for iOS
    unlockAudio()
    setGameState('countdown')
    setCountdown(3)
  }

  const getStarRating = (score: number): number => {
    if (score >= 250) return 5
    if (score >= 200) return 4
    if (score >= 150) return 3
    if (score >= 100) return 2
    return 1
  }

  const shareResults = () => {
    const totalScore =
      savedState?.totalScore ?? roundScores.reduce<number>((a, b) => a + (b || 0), 0)
    const stars = getStarRating(totalScore)
    const scores = savedState?.roundScores || roundScores
    const streak = savedState?.highestStreak || highestStreak
    const getEmoji = (score: number | null) => {
      if (score === null) return '⬜'
      if (score >= 80) return '🟢'
      if (score >= 60) return '🟡'
      if (score >= 40) return '🟠'
      return '🔴'
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const text = `🎹 Simon Says Day ${dayNumber}\n\n${'⭐'.repeat(stars)}${'☆'.repeat(5 - stars)}\nScore: ${totalScore}/300\nLongest Streak: ${streak}\n\n${getEmoji(scores[0])} Easy: ${scores[0] || 0}\n${getEmoji(scores[1])} Medium: ${scores[1] || 0}\n${getEmoji(scores[2])} Hard: ${scores[2] || 0}\n\n${baseUrl}/simon`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Game Complete Screen
  if (gameState === 'gameComplete') {
    const totalScore =
      savedState?.totalScore ?? roundScores.reduce<number>((a, b) => a + (b || 0), 0)
    const stars = getStarRating(totalScore)
    const scores = savedState?.roundScores || roundScores
    const streak = savedState?.highestStreak || highestStreak

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '20px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
              Day {dayNumber}
            </div>
            <h1 style={{ fontSize: '32px', color: 'white', margin: '0 0 16px 0' }}>
              🎹 Simon Says Complete!
            </h1>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              {'⭐'.repeat(stars)}
              {'☆'.repeat(5 - stars)}
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffd700' }}>
              {totalScore}/300
            </div>
            <div style={{ fontSize: '16px', color: '#94a3b8', marginTop: '8px' }}>
              Longest Streak: {streak} 🔥
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  marginBottom: i < 2 ? '12px' : 0,
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      color: difficultyColors[difficulties[i]],
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {difficultyLabels[i]}
                  </span>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color:
                        (scores[i] || 0) >= 60
                          ? '#22c55e'
                          : (scores[i] || 0) >= 40
                            ? '#f59e0b'
                            : '#ef4444',
                      fontSize: '18px',
                    }}
                  >
                    {scores[i] || 0} pts
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={shareResults}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: copied ? '#22c55e' : '#3b82f6',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Share Results'}
          </button>
        </div>
      </div>
    )
  }

  // Round Result Screen
  if (showResult) {
    const difficulty = difficulties[round]
    const settings = difficultySettings[difficulty]

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '20px' }}>
            <h1 style={{ fontSize: '28px', color: 'white', margin: '0 0 8px 0' }}>🎹 Simon Says</h1>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Day {dayNumber}</div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>
              {(roundScores[round] || 0) >= 80
                ? '🎉'
                : (roundScores[round] || 0) >= 40
                  ? '👍'
                  : '😅'}
            </div>
            <div
              style={{
                fontSize: '24px',
                color: (roundScores[round] || 0) >= 60 ? '#22c55e' : '#f59e0b',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              {roundScores[round] === 100 ? 'Perfect!' : 'Round Over'}
            </div>
            <div style={{ fontSize: '16px', color: '#94a3b8' }}>
              You reached {sequenceLength - (roundScores[round] === 100 ? 0 : 1)} /{' '}
              {settings.target}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}
            >
              Points Earned
            </div>
            <div style={{ fontSize: '48px', color: '#ffd700', fontWeight: 'bold' }}>
              +{roundScores[round]}
            </div>
          </div>

          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: round < 2 ? difficultyColors[difficulties[round + 1]] : '#3b82f6',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {round < 2 ? `Next: ${difficultyLabels[round + 1]} →` : '🏆 See Results'}
          </button>
        </div>
      </div>
    )
  }

  // Countdown Screen
  if (gameState === 'countdown') {
    const difficulty = difficulties[round]

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            {difficultyLabels[round]} ROUND
          </div>
          <div
            style={{
              fontSize: countdown === 0 ? '80px' : '120px',
              fontWeight: 'bold',
              color: countdown === 0 ? '#22c55e' : difficultyColors[difficulty],
              textShadow: `0 0 40px ${countdown === 0 ? '#22c55e' : difficultyColors[difficulty]}`,
              animation: 'pulse 0.5s ease-in-out',
            }}
          >
            {countdown === 0 ? 'GO!' : countdown}
          </div>
          <div style={{ fontSize: '16px', color: '#94a3b8', marginTop: '24px' }}>Get ready...</div>
        </div>
      </div>
    )
  }

  // Ready Screen
  if (gameState === 'ready') {
    const difficulty = difficulties[round]
    const settings = difficultySettings[difficulty]

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '20px' }}>
            <h1 style={{ fontSize: '32px', color: 'white', margin: '0 0 8px 0' }}>🎹 Simon Says</h1>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Day {dayNumber}</div>
          </div>

          {/* Round Indicator */}
          <div
            style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background:
                      roundScores[i] !== null
                        ? '#22c55e'
                        : i === round
                          ? difficultyColors[difficulties[i]]
                          : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    margin: '0 auto 4px',
                  }}
                >
                  {roundScores[i] !== null ? '✓' : i + 1}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: difficultyColors[difficulties[i]],
                    fontWeight: 'bold',
                  }}
                >
                  {difficultyLabels[i]}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: difficultyColors[difficulty],
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            >
              {difficultyLabels[round]} ROUND
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
              Starting sequence:{' '}
              <span style={{ color: 'white', fontWeight: 'bold' }}>{settings.start}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              Target to beat:{' '}
              <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{settings.target}</span>
            </div>
          </div>

          {/* Sound toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: soundEnabled ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: soundEnabled ? '#60a5fa' : '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
          </div>

          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '12px',
              border: 'none',
              background: difficultyColors[difficulty],
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ▶️ Start Round
          </button>
        </div>
      </div>
    )
  }

  // Main Game Screen
  const difficulty = difficulties[round]
  const settings = difficultySettings[difficulty]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px', paddingTop: '10px' }}>
          <h1 style={{ fontSize: '24px', color: 'white', margin: '0 0 4px 0' }}>🎹 Simon Says</h1>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Day {dayNumber}</div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Round</div>
            <div
              style={{ fontSize: '16px', color: difficultyColors[difficulty], fontWeight: 'bold' }}
            >
              {difficultyLabels[round]}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Sequence</div>
            <div style={{ fontSize: '20px', color: '#ffd700', fontWeight: 'bold' }}>
              {sequenceLength}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Target</div>
            <div style={{ fontSize: '16px', color: 'white', fontWeight: 'bold' }}>
              {settings.target}
            </div>
          </div>
        </div>

        {/* Message */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '16px',
            padding: '12px',
            background: isPlayerTurn ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: `1px solid ${isPlayerTurn ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          }}
        >
          <span
            style={{
              color: isPlayerTurn ? '#4ade80' : '#60a5fa',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {message || (isPlayerTurn ? 'Your turn!' : 'Watch...')}
          </span>
          {isPlayerTurn && (
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {playerSequence.length} / {sequenceLength}
            </div>
          )}
        </div>

        {/* Simon Board */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '20px',
            background: '#0f172a',
            borderRadius: '50%',
            aspectRatio: '1',
            maxWidth: '320px',
            margin: '0 auto',
          }}
        >
          {COLORS.map((color, index) => {
            const isActive = activeButton === index
            const isTopLeft = index === 0
            const isTopRight = index === 1
            const isBottomLeft = index === 2
            const isBottomRight = index === 3

            return (
              <button
                key={index}
                onClick={() => handleButtonPress(index)}
                disabled={!isPlayerTurn || isPlaying}
                style={{
                  background: isActive ? color.lit : color.base,
                  border: 'none',
                  borderRadius: isTopLeft
                    ? '100% 0 0 0'
                    : isTopRight
                      ? '0 100% 0 0'
                      : isBottomLeft
                        ? '0 0 0 100%'
                        : isBottomRight
                          ? '0 0 100% 0'
                          : '0',
                  cursor: isPlayerTurn && !isPlaying ? 'pointer' : 'default',
                  transition: 'all 0.1s',
                  boxShadow: isActive
                    ? `0 0 30px ${color.lit}, inset 0 0 20px rgba(255,255,255,0.3)`
                    : `inset 0 0 20px ${color.dark}`,
                  transform: isActive ? 'scale(0.98)' : 'scale(1)',
                  opacity: !isPlayerTurn && !isPlaying ? 0.5 : 1,
                }}
              />
            )
          })}
        </div>

        {/* Sound toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#64748b',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Simon
