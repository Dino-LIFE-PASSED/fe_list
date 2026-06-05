import { Router } from 'express'
import { unlink } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import supabase from '../db/supabase.js'
import upload from '../middleware/upload.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logActivity, taskUrgency } from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function deleteUploadFile(imagePath) {
  if (!imagePath) return
  try {
    const filename = imagePath.split('/').pop()
    await unlink(path.join(__dirname, '..', 'uploads', filename))
  } catch {
    // file already gone — ignore
  }
}

const router = Router()
router.use(authenticate)

const TASK_SELECT = '*, engineer:engineers(id, name, avatar_path, status), task_images(id, image_path, created_at)'

function sanitize(body) {
  const updates = { ...body }
  if (updates.engineer_id === '') updates.engineer_id = null
  if (updates.due_date === '') updates.due_date = null
  if (updates.description === '') updates.description = null
  return updates
}

async function saveImages(taskId, files) {
  if (!files?.length) return
  const rows = files.map(f => ({ task_id: taskId, image_path: `/uploads/${f.filename}` }))
  const { error } = await supabase.from('task_images').insert(rows)
  if (error) console.error('[saveImages] DB error:', error.message)
  else console.log(`[saveImages] inserted ${rows.length} image(s) for task ${taskId}`)
}

router.get('/', async (req, res) => {
  let query = supabase
    .from('tasks')
    .select(TASK_SELECT)
    .order('created_at', { ascending: false })

  if (req.query.status) query = query.eq('status', req.query.status)
  if (req.query.engineer_id) query = query.eq('engineer_id', req.query.engineer_id)
  if (req.query.priority) query = query.eq('priority', req.query.priority)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.get('/summary', async (req, res) => {
  const { data, error } = await supabase.from('tasks').select('status')
  if (error) return res.status(500).json({ error: error.message })

  const summary = { todo: 0, in_progress: 0, review: 0, done: 0 }
  data.forEach(t => summary[t.status]++)
  res.json(summary)
})

// Create task — super_user + manager only
router.post('/', requireRole('super_user', 'manager'), upload.array('images', 10), async (req, res) => {
  const fields = sanitize(req.body)
  if (!fields.engineer_id) return res.status(400).json({ error: 'engineer_id is required' })

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: fields.title,
      description: fields.description ?? null,
      status: fields.status || 'todo',
      priority: fields.priority || 'medium',
      engineer_id: fields.engineer_id,
      due_date: fields.due_date,
    })
    .select(TASK_SELECT)
    .single()
  if (error) return res.status(500).json({ error: error.message })

  await saveImages(data.id, req.files)

  const { data: full } = await supabase.from('tasks').select(TASK_SELECT).eq('id', data.id).single()

  logActivity({
    userId: req.user.id,
    action: 'task_created',
    entityType: 'task',
    entityTitle: full.title,
    meta: { priority: full.priority, status: full.status },
    urgency: taskUrgency(full.priority),
  })

  res.status(201).json(full)
})

// Edit task — super_user + manager (with restrictions)
router.patch('/:id', upload.array('images', 10), async (req, res) => {
  const { role, engineer_id: userEngineerId } = req.user

  if (role === 'engineer') return res.status(403).json({ error: 'Forbidden' })

  if (role === 'manager') {
    if (req.body.status === 'done') {
      return res.status(403).json({ error: 'Managers cannot approve tasks' })
    }
    const { data: existing } = await supabase
      .from('tasks').select('engineer_id').eq('id', req.params.id).single()
    const engineer_ids = req.user.engineer_ids ?? []
    if (!engineer_ids.includes(existing?.engineer_id)) {
      return res.status(403).json({ error: 'Can only edit tasks assigned to your engineers' })
    }
  }

  const updates = sanitize(req.body)
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', req.params.id)
    .select(TASK_SELECT)
    .single()
  if (error) return res.status(500).json({ error: error.message })

  await saveImages(req.params.id, req.files)

  const { data: full } = await supabase.from('tasks').select(TASK_SELECT).eq('id', data.id).single()

  const isStatusChange = 'status' in req.body
  logActivity({
    userId: req.user.id,
    action: isStatusChange ? 'status_changed' : 'task_updated',
    entityType: 'task',
    entityTitle: full.title,
    meta: isStatusChange
      ? { to_status: full.status, priority: full.priority }
      : { priority: full.priority },
    urgency: full.status === 'done' ? 'critical'
           : full.priority === 'high' ? 'high'
           : taskUrgency(full.priority),
  })

  res.json(full)
})

// Delete task — super_user only
router.delete('/:id', requireRole('super_user'), async (req, res) => {
  const taskId = req.params.id

  // Fetch task info for logging before delete
  const { data: taskInfo } = await supabase.from('tasks').select('title, priority').eq('id', taskId).single()

  // 1. Collect all image paths before deleting
  const [{ data: taskImages }, { data: comments }] = await Promise.all([
    supabase.from('task_images').select('image_path').eq('task_id', taskId),
    supabase.from('comments').select('image_path').eq('task_id', taskId),
  ])

  const filesToDelete = [
    ...(taskImages?.map(i => i.image_path) ?? []),
    ...(comments?.filter(c => c.image_path).map(c => c.image_path) ?? []),
  ]

  // 2. Delete child records then task
  await supabase.from('task_images').delete().eq('task_id', taskId)
  await supabase.from('comments').delete().eq('task_id', taskId)

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) return res.status(500).json({ error: error.message })

  // 3. Delete files from disk (best-effort, after DB is clean)
  await Promise.all(filesToDelete.map(deleteUploadFile))

  logActivity({
    userId: req.user.id,
    action: 'task_deleted',
    entityType: 'task',
    entityTitle: taskInfo?.title,
    meta: { priority: taskInfo?.priority },
    urgency: 'critical',
  })

  res.status(204).send()
})

export default router
