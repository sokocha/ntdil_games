'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadAllStats, AllStats } from '@/lib/stats'
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  requestNotificationPermission,
  getNotificationPermission,
  scheduleLocalNotification,
  hasSeenNotificationPrompt,
  markNotificationPromptSeen,
  NotificationPrefs,
} from '@/lib/notifications'

export default function StatsPage() {
  const [stats, setStats] = useState<AllStats | null>(null)
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({ enabled: false, time: '09:00' })
  // eslint-disable-next-line no-undef
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    'default'
  )

  useEffect(() => {
    setStats(loadAllStats())
    const prefs = loadNotificationPrefs()
    setNotifPrefs(prefs)
    setNotifPermission(getNotificationPermission())

    // Auto-prompt for notification permission on first visit
    if (prefs.enabled && !hasSeenNotificationPrompt()) {
      markNotificationPromptSeen()
      requestNotificationPermission().then((granted) => {
        if (granted) {
          saveNotificationPrefs(prefs)
          scheduleLocalNotification()
          setNotifPermission('granted')
        } else {
          // If denied, turn off the toggle
          const newPrefs = { ...prefs, enabled: false }
          setNotifPrefs(newPrefs)
          saveNotificationPrefs(newPrefs)
          setNotifPermission(getNotificationPermission())
        }
      })
    }
  }, [])

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading stats...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Stats</h1>
          <p className="text-gray-400">Track your progress across all games</p>
        </div>

        {/* Overall Stats */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Overall</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Games" value={stats.totalGamesPlayed} icon="🎮" />
            <StatCard
              label="Best Streak"
              value={Math.max(stats.squaddle.bestStreak, stats.outliers.bestStreak)}
              icon="🔥"
              suffix=" days"
            />
          </div>
        </div>

        {/* Squaddle Stats */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-purple-400">⚽ Squaddle</h2>
            <Link href="/squaddle" className="text-sm text-gray-400 hover:text-white">
              Play →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard label="Games" value={stats.squaddle.gamesPlayed} />
            <StatCard label="Average" value={stats.squaddle.averageScore} />
            <StatCard label="Best" value={stats.squaddle.bestScore} />
            <StatCard label="Streak" value={stats.squaddle.currentStreak} icon="🔥" />
          </div>
          {stats.squaddle.recentScores.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Recent Games</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {stats.squaddle.recentScores.map((score) => (
                  <div
                    key={score.dayNum}
                    className="flex-shrink-0 bg-gray-800 rounded-lg px-3 py-2 text-center min-w-[60px]"
                  >
                    <div className="text-xs text-gray-500">#{score.dayNum}</div>
                    <div className="font-bold text-purple-400">{score.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simon Stats */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-400">🎹 Simon</h2>
            <Link href="/simon" className="text-sm text-gray-400 hover:text-white">
              Play →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard label="Games" value={stats.simon.gamesPlayed} />
            <StatCard label="Average" value={stats.simon.averageScore} />
            <StatCard label="Best" value={stats.simon.bestScore} />
            <StatCard label="Longest" value={stats.simon.bestStreak} suffix=" seq" />
          </div>
          {stats.simon.recentGames.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Recent Games</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {stats.simon.recentGames.map((game) => (
                  <div
                    key={game.dayNumber}
                    className="flex-shrink-0 bg-gray-800 rounded-lg px-3 py-2 text-center min-w-[60px]"
                  >
                    <div className="text-xs text-gray-500">Day {game.dayNumber}</div>
                    <div className="font-bold text-blue-400">{game.totalScore}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Outliers Stats */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-400">🎯 Outliers</h2>
            <Link href="/outliers" className="text-sm text-gray-400 hover:text-white">
              Play →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Streak" value={stats.outliers.currentStreak} icon="🔥" />
            <StatCard label="Best Streak" value={stats.outliers.bestStreak} />
            <StatCard label="Perfect" value={stats.outliers.perfectGames} />
            <StatCard label="Last Day" value={stats.outliers.lastPlayed || '-'} />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Daily Reminders</h2>

          {notifPermission === 'unsupported' ? (
            <p className="text-gray-500 text-sm">
              Notifications are not supported in this browser.
            </p>
          ) : notifPermission === 'denied' ? (
            <p className="text-gray-500 text-sm">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Reminders</div>
                  <div className="text-sm text-gray-400">Get notified to play daily</div>
                </div>
                <button
                  onClick={async () => {
                    if (!notifPrefs.enabled) {
                      const granted = await requestNotificationPermission()
                      if (granted) {
                        const newPrefs = { ...notifPrefs, enabled: true }
                        setNotifPrefs(newPrefs)
                        saveNotificationPrefs(newPrefs)
                        scheduleLocalNotification()
                        setNotifPermission('granted')
                      }
                    } else {
                      const newPrefs = { ...notifPrefs, enabled: false }
                      setNotifPrefs(newPrefs)
                      saveNotificationPrefs(newPrefs)
                    }
                  }}
                  className={`w-14 h-8 rounded-full transition-colors relative ${
                    notifPrefs.enabled ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                      notifPrefs.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {notifPrefs.enabled && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reminder Time</div>
                    <div className="text-sm text-gray-400">When to send notification</div>
                  </div>
                  <input
                    type="time"
                    value={notifPrefs.time}
                    onChange={(e) => {
                      const newPrefs = { ...notifPrefs, time: e.target.value }
                      setNotifPrefs(newPrefs)
                      saveNotificationPrefs(newPrefs)
                      scheduleLocalNotification()
                    }}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* No data message */}
        {stats.totalGamesPlayed === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎮</div>
            <p className="text-gray-400 mb-4">No games played yet!</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Playing
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  suffix = '',
}: {
  label: string
  value: number | string
  icon?: string
  suffix?: string
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <div className="text-2xl font-bold">
        {icon && <span className="mr-1">{icon}</span>}
        {value}
        {suffix}
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
  )
}
