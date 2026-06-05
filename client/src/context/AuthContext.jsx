import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const PERMS = {
  createTask:     ['super_user', 'manager'],
  editTask:       ['super_user', 'manager'],
  deleteTask:     ['super_user'],
  approveTask:    ['super_user'],
  changeStatus:   ['super_user', 'manager'],
  comment:        ['super_user', 'manager', 'engineer'],
  manageUsers:    ['super_user'],
  manageEngineers:['super_user'],
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const { data } = await axios.post('/api/auth/login', { username, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const can = (action) => {
    if (!user) return false
    return PERMS[action]?.includes(user.role) ?? false
  }

  // Manager can only edit tasks assigned to their linked engineer
  const canEditTask = (task) => {
    if (!user) return false
    if (user.role === 'super_user') return true
    if (user.role === 'manager') {
      const ids = user.engineer_ids ?? []
      return ids.includes(task?.engineer_id)
    }
    return false
  }

  // Manager cannot change to 'done'
  const canSetStatus = (toStatus) => {
    if (!user) return false
    if (user.role === 'super_user') return true
    if (user.role === 'manager') return toStatus !== 'done'
    return false
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can, canEditTask, canSetStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
