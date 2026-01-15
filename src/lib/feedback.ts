// Audio and haptic feedback utilities for games

// Audio context singleton
/* eslint-disable no-undef */
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioContext = new AudioContextClass()
    }
  }
  return audioContext
}

// Unlock audio for iOS - must be called on user gesture
export function unlockAudio(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  // Play silent buffer to unlock on iOS
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)
}

// Play a tone with given frequency and duration
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3
): void {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  try {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available
  }
}

// Sound effects
export function playCorrectSound(): void {
  // Pleasant ascending two-tone
  playTone(523.25, 0.1) // C5
  setTimeout(() => playTone(659.25, 0.15), 100) // E5
}

export function playWrongSound(): void {
  // Descending buzz
  playTone(200, 0.3, 'sawtooth', 0.2)
}

export function playRoundCompleteSound(): void {
  // Ascending arpeggio
  playTone(523.25, 0.1) // C5
  setTimeout(() => playTone(659.25, 0.1), 100) // E5
  setTimeout(() => playTone(783.99, 0.15), 200) // G5
}

export function playGameCompleteSound(): void {
  // Victory fanfare
  playTone(523.25, 0.15) // C5
  setTimeout(() => playTone(659.25, 0.15), 150) // E5
  setTimeout(() => playTone(783.99, 0.15), 300) // G5
  setTimeout(() => playTone(1046.5, 0.3), 450) // C6
}

export function playStreakSound(): void {
  // Exciting ascending tones
  playTone(440, 0.1) // A4
  setTimeout(() => playTone(554.37, 0.1), 80) // C#5
  setTimeout(() => playTone(659.25, 0.1), 160) // E5
  setTimeout(() => playTone(880, 0.2), 240) // A5
}

export function playClickSound(): void {
  // Soft click
  playTone(800, 0.05, 'sine', 0.15)
}

// Haptic feedback
export function vibrateCorrect(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(50) // Short vibration
  }
}

export function vibrateWrong(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([100, 50, 100]) // Double vibration pattern
  }
}

export function vibrateSuccess(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([50, 50, 50, 50, 100]) // Celebration pattern
  }
}

// Combined feedback functions
export function feedbackCorrect(): void {
  playCorrectSound()
  vibrateCorrect()
}

export function feedbackWrong(): void {
  playWrongSound()
  vibrateWrong()
}

export function feedbackRoundComplete(): void {
  playRoundCompleteSound()
  vibrateSuccess()
}

export function feedbackGameComplete(): void {
  playGameCompleteSound()
  vibrateSuccess()
}

export function feedbackStreak(): void {
  playStreakSound()
  vibrateSuccess()
}
