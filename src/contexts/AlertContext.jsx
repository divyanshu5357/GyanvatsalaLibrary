import React, { createContext, useContext, useCallback } from 'react'

const AlertContext = createContext()

export function useAlert() {
  return useContext(AlertContext)
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = React.useState([])

  const showAlert = useCallback((options) => {
    const {
      title = 'Alert',
      message = '',
      type = 'info', // 'info', 'success', 'warning', 'error'
      duration = 4000,
    } = typeof options === 'string' ? { message: options } : options

    const id = Math.random().toString(36).substr(2, 9)
    const alert = { id, title, message, type }

    setAlerts((prev) => [...prev, alert])

    if (duration > 0) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
      }, duration)
    }

    return id
  }, [])

  const closeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert, alerts }}>
      {children}
    </AlertContext.Provider>
  )
}
