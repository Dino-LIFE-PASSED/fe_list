import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export const getTasks    = (params)      => api.get('/tasks', { params })
export const getTaskSummary = ()         => api.get('/tasks/summary')
export const createTask  = (formData)    => api.post('/tasks', formData)
export const updateTask  = (id, formData)=> api.patch(`/tasks/${id}`, formData)
export const deleteTask  = (id)          => api.delete(`/tasks/${id}`)

export const deleteTaskImage = (id)      => api.delete(`/task-images/${id}`)

export const getComments   = (taskId)           => api.get(`/tasks/${taskId}/comments`)
export const createComment = (taskId, formData) => api.post(`/tasks/${taskId}/comments`, formData)
export const deleteComment = (id)               => api.delete(`/comments/${id}`)

export const getEngineers    = ()              => api.get('/engineers')
export const createEngineer  = (formData)      => api.post('/engineers', formData)
export const updateEngineer  = (id, formData)  => api.patch(`/engineers/${id}`, formData)
export const deleteEngineer  = (id)            => api.delete(`/engineers/${id}`)

export const getLogs     = ()              => api.get('/logs')
export const getUsers    = ()              => api.get('/users')
export const createUser  = (body)          => api.post('/users', body)
export const updateUser  = (id, body)      => api.patch(`/users/${id}`, body)
export const deleteUser  = (id)            => api.delete(`/users/${id}`)
