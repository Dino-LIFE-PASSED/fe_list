import { useState, useEffect, useCallback } from 'react'
import { getComments, createComment, deleteComment } from '../api'

export function useComments(taskId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getComments(taskId)
    setComments(res.data)
    setLoading(false)
  }, [taskId])

  useEffect(() => { load() }, [load])

  const add = async (formData) => {
    const res = await createComment(taskId, formData)
    setComments(prev => [...prev, res.data])
  }

  const remove = async (id) => {
    await deleteComment(id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return { comments, loading, add, remove }
}
