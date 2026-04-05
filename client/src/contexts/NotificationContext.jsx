import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { apiBase, authFetch } from '../utils/api'
import { isPaidForCurrentCycle } from '../utils/feeStatus'

const NotificationContext = createContext(null)

function daysBetween(now, target) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const diff = new Date(target).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)
  return Math.floor(diff / MS_PER_DAY)
}

function buildStudentNotifications(student) {
  if (!student) return []

  if (isPaidForCurrentCycle(student)) return []
  
  const dueDate = student.fee_due_date || student.next_due
  if (!dueDate) return []
  
  const days = daysBetween(new Date(), dueDate)
  const isOverdue = days < 0
  const isDueSoon = days >= 0 && days <= 3
  
  // Only send notification if overdue OR due in next 3 days
  // Don't send if due date is more than 3 days away
  if (!isOverdue && !isDueSoon) return []
  
  const seat = student.seat_number ? `Seat ${student.seat_number}` : 'No seat'
  const id = `${student.id || 'me'}-${isOverdue ? 'overdue' : 'due'}-${dueDate}`
  const message = isOverdue
    ? `Your fee is overdue by ${Math.abs(days)} day(s). (${seat})`
    : `Your fee is due in ${days} day(s). (${seat})`
  
  return [{
    id,
    type: isOverdue ? 'overdue' : 'due-soon',
    message,
    createdAt: new Date().toISOString(),
    read: false,
  }]
}

export function NotificationProvider({ children }) {
  const { profile, currentUser } = useAuth()
  const [items, setItems] = useState([])
  const [toasts, setToasts] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const askedRef = useRef(false)
  const seenIdsRef = useRef(new Set())
  const [vapidKey, setVapidKey] = useState(null)

  const role = profile?.role

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const requestPermissionIfNeeded = async () => {
    if (askedRef.current) return
    askedRef.current = true
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') return
    try {
      await Notification.requestPermission()
    } catch (err) {
      console.warn('Notification permission error', err)
    }
  }

  const pushToast = (item) => {
    setToasts(prev => [...prev, item])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== item.id))
    }, 4000)

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('Gyanvatsala Library', { body: item.message })
      } catch (err) {
        console.warn('Web notification failed', err)
      }
    }
  }

  const syncNotifications = (incoming) => {
    incoming.forEach(n => {
      if (!seenIdsRef.current.has(n.id)) {
        seenIdsRef.current.add(n.id)
        pushToast(n)
      }
    })

    setItems(prev => {
      const previousById = new Map(prev.map(item => [item.id, item]))

      return incoming
        .map(item => {
          const previous = previousById.get(item.id)
          return {
            ...item,
            createdAt: previous?.createdAt || item.createdAt,
            read: previous?.read ?? item.read ?? false,
          }
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
  }

  useEffect(() => {
    if (role === 'admin') {
      const load = async () => {
        try {
          const res = await authFetch('/api/admin/notifications')
          if (!res.ok) return
          const data = await res.json()
          const incoming = (data.notifications || []).map(n => ({
            id: `${n.studentId || 'student'}-${n.status}-${n.dueDate}`,
            type: n.status,
            message: n.message,
            createdAt: new Date().toISOString(),
            read: false,
            meta: n,
          }))
          syncNotifications(incoming)
        } catch (err) {
          console.warn('Admin notifications fetch failed', err.message)
        }
      }
      load()
      const t = setInterval(load, 60_000)
      return () => clearInterval(t)
    }
  }, [role])

  useEffect(() => {
    if (role === 'student' && currentUser) {
      const load = async () => {
        try {
          const res = await authFetch(`/api/student/me?userId=${encodeURIComponent(currentUser.id)}`)
          if (!res.ok) return
          const data = await res.json()
          const incoming = buildStudentNotifications(data.student)
          syncNotifications(incoming)
        } catch (err) {
          console.warn('Student notifications fetch failed', err.message)
        }
      }
      load()
      const t = setInterval(load, 60_000)
      return () => clearInterval(t)
    }
  }, [role, currentUser])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW register failed', err))
    }
  }, [])

  // Get public VAPID key
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await fetch(`${apiBase}/api/notifications/public-key`)
        if (!res.ok) return
        const data = await res.json()
        setVapidKey(data.publicKey || null)
      } catch (err) {
        console.warn('Failed to load VAPID key', err.message)
      }
    }
    fetchKey()
  }, [])

  // Register push subscription with backend
  useEffect(() => {
    const subscribe = async () => {
      if (!currentUser || Notification.permission !== 'granted' || !vapidKey) return
      if (!('serviceWorker' in navigator)) return
      try {
        const reg = await navigator.serviceWorker.ready
        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          })
        }

        await authFetch('/api/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify({ subscription: sub }),
        })
      } catch (err) {
        console.warn('Push subscribe failed', err.message)
      }
    }
    subscribe()
  }, [currentUser, vapidKey])

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))

  const value = useMemo(() => ({
    items,
    toasts,
    unreadCount: items.filter(n => !n.read).length,
    dropdownOpen,
    setDropdownOpen,
    markAllRead,
  }), [items, toasts, dropdownOpen])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
