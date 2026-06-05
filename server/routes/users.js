import { Router } from 'express'
import bcrypt from 'bcrypt'
import supabase from '../db/supabase.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logActivity } from '../utils/logger.js'

const router = Router()
router.use(authenticate, requireRole('super_user'))

async function attachEngineers(users) {
  if (!users.length) return users
  const ids = users.map(u => u.id)
  const { data: links } = await supabase
    .from('user_engineers')
    .select('user_id, engineer_id, engineer:engineers(id, name, avatar_path)')
    .in('user_id', ids)

  return users.map(u => ({
    ...u,
    engineer_ids: links?.filter(l => l.user_id === u.id).map(l => l.engineer_id) ?? [],
    engineers:    links?.filter(l => l.user_id === u.id).map(l => l.engineer) ?? [],
  }))
}

async function setEngineers(userId, engineer_ids = []) {
  await supabase.from('user_engineers').delete().eq('user_id', userId)
  if (engineer_ids.length > 0) {
    await supabase.from('user_engineers').insert(
      engineer_ids.map(eid => ({ user_id: userId, engineer_id: eid }))
    )
  }
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, created_at')
    .order('created_at')
  if (error) return res.status(500).json({ error: error.message })
  res.json(await attachEngineers(data))
})

router.post('/', async (req, res) => {
  const { username, password, role, engineer_ids = [] } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  const password_hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from('users')
    .insert({ username: username.trim(), password_hash, role: role || 'engineer' })
    .select('id, username, role, created_at')
    .single()
  if (error) return res.status(500).json({ error: error.message })

  await setEngineers(data.id, engineer_ids)
  const [enriched] = await attachEngineers([data])
  logActivity({ userId: req.user.id, action: 'user_created', entityType: 'user', entityTitle: data.username, meta: { role: data.role }, urgency: 'medium' })
  res.status(201).json(enriched)
})

router.patch('/:id', async (req, res) => {
  const updates = {}
  if (req.body.role) updates.role = req.body.role
  if (req.body.password) updates.password_hash = await bcrypt.hash(req.body.password, 10)

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, username, role, created_at')
    .single()
  if (error) return res.status(500).json({ error: error.message })

  if ('engineer_ids' in req.body) {
    await setEngineers(req.params.id, req.body.engineer_ids ?? [])
  }

  const [enriched] = await attachEngineers([data])
  logActivity({ userId: req.user.id, action: 'user_updated', entityType: 'user', entityTitle: data.username, meta: { role: data.role }, urgency: 'medium' })
  res.json(enriched)
})

router.delete('/:id', async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' })
  const { data: target } = await supabase.from('users').select('username').eq('id', req.params.id).single()
  const { error } = await supabase.from('users').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  logActivity({ userId: req.user.id, action: 'user_deleted', entityType: 'user', entityTitle: target?.username, urgency: 'medium' })
  res.status(204).end()
})

export default router
