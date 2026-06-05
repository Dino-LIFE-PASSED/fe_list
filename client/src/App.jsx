import { useAuth, AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  return user ? <Home /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
