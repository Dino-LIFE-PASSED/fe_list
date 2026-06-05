import { Router } from 'express'
import supabase from '../db/supabase.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authenticate, requireRole('super_user'))

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, user:users(id, username)')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
