import { useState, useEffect } from 'react'
import { getEngineers, createEngineer, updateEngineer, deleteEngineer } from '../api'

export function useEngineers() {
  const [engineers, setEngineers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEngineers().then(({ data }) => {
      setEngineers(data)
      setLoading(false)
    })
  }, [])

  const add = async (formData) => {
    const { data } = await createEngineer(formData)
    setEngineers(prev => [...prev, data])
    return data
  }

  const update = async (id, formData) => {
    const { data } = await updateEngineer(id, formData)
    setEngineers(prev => prev.map(e => e.id === id ? data : e))
    return data
  }

  const remove = async (id) => {
    await deleteEngineer(id)
    setEngineers(prev => prev.filter(e => e.id !== id))
  }

  return { engineers, loading, add, update, remove }
}
