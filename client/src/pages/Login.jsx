import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

export default function Login() {
  const { login } = useAuth()
  const [mode, setMode]         = useState('loading') // 'loading' | 'login' | 'bootstrap'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios.get('/api/auth/bootstrap-status')
      .then(({ data }) => setMode(data.initialized ? 'login' : 'bootstrap'))
      .catch(() => setMode('login'))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBootstrap = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await axios.post('/api/auth/bootstrap', { username, password })
      await login(username, password)
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  const isBootstrap = mode === 'bootstrap'

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo_fe.png" alt="" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <p className="text-lg font-bold text-white leading-none">JobTracker</p>
            <p className="text-[11px] text-slate-500 mt-0.5">FE Engineer</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
          {isBootstrap ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-700">First Run</span>
              </div>
              <h1 className="text-base font-bold text-slate-100 mb-0.5">Create Admin Account</h1>
              <p className="text-xs text-slate-500 mb-5">ระบบยังไม่มีผู้ใช้ — สร้าง Super User คนแรก</p>
            </>
          ) : (
            <>
              <h1 className="text-base font-bold text-slate-100 mb-0.5">Sign in</h1>
              <p className="text-xs text-slate-500 mb-5">Enter your credentials to continue</p>
            </>
          )}

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs px-3 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={isBootstrap ? handleBootstrap : handleLogin} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Username</label>
              <input
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete={isBootstrap ? 'new-password' : 'current-password'}
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full py-2.5 rounded-xl bg-blue-500 text-sm font-semibold text-slate-950 hover:bg-blue-400 disabled:opacity-50 transition-colors"
            >
              {submitting ? '...' : isBootstrap ? 'Create Admin & Sign in' : 'Sign in'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
