import { Router } from 'express'
import supabase from '../db/supabase.js'
import upload from '../middleware/upload.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('engineers')
    .select('*')
    .order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/', requireRole('super_user'), upload.single('avatar'), async (req, res) => {
  const { name, status } = req.body
  const avatar_path = req.file ? `/uploads/${req.file.filename}` : null
  const { data, error } = await supabase
    .from('engineers')
    .insert({ name, status: status || 'offline', avatar_path })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.patch('/:id', requireRole('super_user'), upload.single('avatar'), async (req, res) => {
  const updates = { ...req.body }
  if (req.file) updates.avatar_path = `/uploads/${req.file.filename}`
  const { data, error } = await supabase
    .from('engineers')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', requireRole('super_user'), async (req, res) => {
  const { error } = await supabase
    .from('engineers')
    .delete()
    .eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

export default router
