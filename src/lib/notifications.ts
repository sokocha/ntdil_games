// Notification utilities for daily reminders
/* eslint-disable no-undef */

const NOTIFICATION_PREF_KEY = 'ntdil-notifications'
const LAST_NOTIFICATION_KEY = 'ntdil-last-notification'

export interface NotificationPrefs {
  enabled: boolean
  time: string // HH:MM format
}

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') {
    return { enabled: false, time: '09:00' }
  }

  const saved = localStorage.getItem(NOTIFICATION_PREF_KEY)
  if (!saved) {
    return { enabled: false, time: '09:00' }
  }

  try {
    return JSON.parse(saved)
  } catch {
    return { enabled: false, time: '09:00' }
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_PREF_KEY, JSON.stringify(prefs))
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

export function scheduleLocalNotification(): void {
  const prefs = loadNotificationPrefs()
  if (!prefs.enabled) return

  const now = new Date()
  const [hours, minutes] = prefs.time.split(':').map(Number)

  const scheduledTime = new Date()
  scheduledTime.setHours(hours, minutes, 0, 0)

  // If the time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const delay = scheduledTime.getTime() - now.getTime()

  // Store the scheduled time
  localStorage.setItem(LAST_NOTIFICATION_KEY, scheduledTime.toISOString())

  // Use setTimeout for local notification (this only works while the page is open)
  // For true background notifications, you'd need a backend with push notifications
  setTimeout(() => {
    showDailyReminder()
    // Schedule the next one
    scheduleLocalNotification()
  }, delay)
}

export function showDailyReminder(): void {
  if (Notification.permission !== 'granted') return

  const lastPlayed = localStorage.getItem('squaddle-streak')
  let message = 'Time to play your daily games!'

  if (lastPlayed) {
    try {
      const data = JSON.parse(lastPlayed)
      if (data.streak > 0) {
        message = `Keep your ${data.streak}-day streak alive! Play now.`
      }
    } catch {
      // Ignore
    }
  }

  new Notification('NTDIL Games', {
    body: message,
    icon: '/icons/icon.svg',
    tag: 'daily-reminder',
    requireInteraction: true,
  })
}

// Check if we should show a notification (for when app loads)
export function checkAndShowNotification(): void {
  const prefs = loadNotificationPrefs()
  if (!prefs.enabled) return
  if (Notification.permission !== 'granted') return

  const lastShown = localStorage.getItem(LAST_NOTIFICATION_KEY)
  if (!lastShown) return

  const lastShownDate = new Date(lastShown)
  const now = new Date()

  // If last notification was scheduled for today and time has passed, show it
  if (lastShownDate.toDateString() === now.toDateString() && lastShownDate <= now) {
    // Check if we already showed today's notification
    const todayKey = `notification-shown-${now.toDateString()}`
    if (!localStorage.getItem(todayKey)) {
      localStorage.setItem(todayKey, 'true')
      showDailyReminder()
    }
  }
}
