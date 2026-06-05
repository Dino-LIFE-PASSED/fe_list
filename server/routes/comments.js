import { Router } from 'express'
import supabase from '../db/supabase.js'
import upload from '../middleware/upload.js'
import { authenticate } from '../middleware/auth.js'
import { logActivity } from '../utils/logger.js'

const router = Router({ mergeParams: true })
router.use(authenticate)

router.get('/', async (req, res) => {
  const { taskId } = req.params
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:users(id, username), engineer:engineers(id, name, avatar_path)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/', upload.single('image'), async (req, res) => {
  const { taskId } = req.params
  const { body } = req.body
  const image_path = req.file ? `/uploads/${req.file.filename}` : null

  if (!body?.trim() && !image_path) {
    return res.status(400).json({ error: 'Comment must have text or image' })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      task_id: taskId,
      user_id: req.user.id,
      body: body?.trim() || null,
      image_path,
    })
    .select('*, user:users(id, username), engineer:engineers(id, name, avatar_path)')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Fetch task title for log
  const { data: task } = await supabase.from('tasks').select('title').eq('id', taskId).single()
  logActivity({
    userId: req.user.id,
    action: 'comment_added',
    entityType: 'comment',
    entityTitle: task?.title,
    meta: { has_image: !!image_path },
    urgency: 'low',
  })

  res.status(201).json(data)
})

export default router
