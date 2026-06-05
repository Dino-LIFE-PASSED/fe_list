import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import supabase from '../db/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_changeme'

async function getEngineerIds(userId) {
  const { data } = await supabase
    .from('user_engineers')
    .select('engineer_id')
    .eq('user_id', userId)
  return data?.map(e => e.engineer_id) ?? []
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.trim())
    .single()

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const engineer_ids = await getEngineerIds(user.id)

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, engineer_ids },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  const { password_hash, ...safeUser } = user
  res.json({ token, user: { ...safeUser, engineer_ids } })
})

router.get('/me', authenticate, async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, username, role, created_at')
    .eq('id', req.user.id)
    .single()
  if (!user) return res.status(404).json({ error: 'User not found' })

  const engineer_ids = await getEngineerIds(user.id)
  res.json({ ...user, engineer_ids })
})

// Bootstrap: create first super_user — only works when users table is empty
router.get('/bootstrap-status', async (req, res) => {
  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
  res.json({ initialized: count > 0 })
})

router.post('/bootstrap', async (req, res) => {
  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
  if (count > 0) return res.status(400).json({ error: 'System already initialized' })

  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  const password_hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from('users')
    .insert({ username: username.trim(), password_hash, role: 'super_user' })
    .select('id, username, role')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ message: 'Super user created', user: data })
})

export default router
