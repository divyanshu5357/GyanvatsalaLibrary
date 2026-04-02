import React, { useEffect, useState } from 'react'
import { supabaseConfigStatus, testSupabaseConnectivity } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

export default function DebugPanel() {
  const { currentUser, profile } = useAuth()
  const [networkResult, setNetworkResult] = useState(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    // no-op on mount
  }, [])

  async function runTest() {
    setRunning(true)
    const res = await testSupabaseConnectivity()
    setNetworkResult(res)
    setRunning(false)
  }

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 1000 }}>
      <div style={{ width: 360 }} className="p-3 glass rounded text-xs text-slate-200">
        <div className="flex items-center justify-between mb-2">
          <strong>Debug Panel</strong>
          <button onClick={runTest} className="ml-2 px-2 py-1 bg-indigo-600 rounded text-white">{running ? 'Running...' : 'Run network test'}</button>
        </div>
        <div className="text-[11px] mb-2">
          <div className="mb-1"><strong>Supabase config:</strong> URL {supabaseConfigStatus.hasUrl ? '✅' : '❌'} · Key {supabaseConfigStatus.hasAnonKey ? '✅' : '❌'}</div>
          <div><strong>Auth user:</strong> {currentUser ? currentUser.id : '— not signed in'}</div>
          <div><strong>Profile:</strong> {profile ? JSON.stringify(profile) : '— no profile loaded'}</div>
        </div>
        <div className="mt-2">
          <strong>Network test:</strong>
          <pre className="mt-1 p-2 bg-slate-900 rounded text-[11px] whitespace-pre-wrap max-h-40 overflow-auto">{networkResult ? JSON.stringify(networkResult, null, 2) : 'Not run'}</pre>
        </div>
      </div>
    </div>
  )
}
