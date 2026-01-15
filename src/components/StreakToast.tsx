'use client'

import { useEffect, useState } from 'react'
import { feedbackStreak } from '@/lib/feedback'

interface StreakToastProps {
  streak: number
  bestStreak: number
  isNewBest: boolean
  show: boolean
  onClose: () => void
}

export default function StreakToast({
  streak,
  bestStreak: _bestStreak,
  isNewBest,
  show,
  onClose,
}: StreakToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      if (streak > 0) {
        feedbackStreak()
      }
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // Wait for fade out animation
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, streak, onClose])

  if (!show && !visible) return null

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-6 py-4 shadow-2xl">
        {streak > 0 ? (
          <div className="text-center">
            <div className="text-3xl mb-1">{'🔥'.repeat(Math.min(streak, 5))}</div>
            <div className="text-white font-bold text-lg">{streak} Day Streak!</div>
            {isNewBest && (
              <div className="text-yellow-400 text-sm font-medium mt-1">New Best Streak!</div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-1">😔</div>
            <div className="text-gray-300 text-sm">Streak lost. Try again tomorrow!</div>
          </div>
        )}
      </div>
    </div>
  )
}
