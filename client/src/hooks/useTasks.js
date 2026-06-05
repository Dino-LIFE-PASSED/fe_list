import { useState, useEffect, useCallback, useRef } from 'react'
import { getTasks, getTaskSummary, createTask, updateTask, deleteTask } from '../api'
import supabase from '../lib/supabase'

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState({ todo: 0, in_progress: 0, review: 0, done: 0 })
  const [loading, setLoading] = useState(true)
  const selfUpdate = useRef(false) // prevent re-fetch when we caused the change

  const load = useCallback(async () => {
    setLoading(true)
    const [tasksRes, summaryRes] = await Promise.all([
      getTasks(filters),
      getTaskSummary()
    ])
    setTasks(tasksRes.data)
    setSummary(summaryRes.data)
    setLoading(false)
  }, [JSON.stringify(filters)])

  useEffect(() => { load() }, [load])

  // Realtime: re-fetch when another user changes tasks table
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        if (selfUpdate.current) { selfUpdate.current = false; return }
        load()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  const add = async (formData) => {
    selfUpdate.current = true
    const { data } = await createTask(formData)
    setTasks(prev => [data, ...prev])
    setSummary(prev => ({ ...prev, [data.status]: prev[data.status] + 1 }))
  }

  const update = async (id, formData) => {
    selfUpdate.current = true
    const old = tasks.find(t => t.id === id)
    const { data } = await updateTask(id, formData)
    setTasks(prev => prev.map(t => t.id === id ? data : t))
    if (old && old.status !== data.status) {
      setSummary(prev => ({
        ...prev,
        [old.status]: prev[old.status] - 1,
        [data.status]: prev[data.status] + 1
      }))
    }
    return data
  }

  const remove = async (id) => {
    selfUpdate.current = true
    const task = tasks.find(t => t.id === id)
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
    if (task) setSummary(prev => ({ ...prev, [task.status]: prev[task.status] - 1 }))
  }

  return { tasks, summary, loading, add, update, remove, reload: load }
}
