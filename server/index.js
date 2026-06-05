import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import tasksRouter from './routes/tasks.js'
import engineersRouter from './routes/engineers.js'
import commentsRouter from './routes/comments.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import logsRouter from './routes/logs.js'
import supabase from './db/supabase.js'
import { authenticate } from './middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/logs', logsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/engineers', engineersRouter)
app.use('/api/tasks/:taskId/comments', commentsRouter)

app.delete('/api/comments/:id', authenticate, async (req, res) => {
  const { error } = await supabase.from('comments').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})

app.delete('/api/task-images/:id', authenticate, async (req, res) => {
  const { error } = await supabase.from('task_images').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})

// Serve React build in production
const publicDir = path.join(__dirname, 'public')
if (existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })
} else {
  app.get('/', (req, res) => res.json({ status: 'ok', message: 'JobTracker API' }))
}

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
