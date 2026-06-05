import { useState, useEffect, useRef } from 'react'
import { deleteTaskImage } from '../../api'

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
]

function getColor(name) {
  let n = 0
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
const selectCls = "w-full bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"

export default function JobForm({ task, engineers, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo',
    priority: 'medium', engineer_id: '', due_date: '',
  })
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title ?? '',
        description: task.description ?? '',
        status: task.status ?? 'todo',
        priority: task.priority ?? 'medium',
        engineer_id: task.engineer_id ?? '',
        due_date: task.due_date ?? '',
      })
      setExistingImages(task.task_images ?? [])
    }
    setNewFiles([])
  }, [task])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleDeleteExisting = async (imgId) => {
    await deleteTaskImage(imgId)
    setExistingImages(prev => prev.filter(i => i.id !== imgId))
  }

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files)
    setNewFiles(prev => [...prev, ...picked])
    e.target.value = ''
  }

  const removeNewFile = (idx) => setNewFiles(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async e => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      newFiles.forEach(f => fd.append('images', f))
      await onSubmit(fd)
    } finally {
      setSubmitting(false)
    }
  }

  const hasAnyImage = existingImages.length > 0 || newFiles.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl shadow-black/40 max-h-[92dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 sm:pt-6 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {task ? 'Update task details below' : 'Fill in the details to create a task'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-slate-700 mx-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Title *</label>
            <input
              required
              placeholder="What needs to be done?"
              className={inputCls}
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              rows={2}
              placeholder="Add more details..."
              className={inputCls}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
              <div className="relative">
                <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="todo">📋 Todo</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="review">👀 Review</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Priority</label>
              <div className="relative">
                <select className={selectCls} value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Assignee *</label>
              <div className="relative">
                <select required className={selectCls} value={form.engineer_id} onChange={e => set('engineer_id', e.target.value)}>
                  <option value="" disabled>Select engineer...</option>
                  {engineers.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              {form.engineer_id && (() => {
                const eng = engineers.find(e => e.id === form.engineer_id)
                return eng ? (
                  <div className="flex items-center gap-1.5 mt-1.5 px-1">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getColor(eng.name)} flex items-center justify-center text-[8px] font-bold text-white`}>
                      {eng.name[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-400">{eng.name}</span>
                  </div>
                ) : null
              })()}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Due Date</label>
              <div className="overflow-hidden rounded-xl border border-slate-600 bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <input
                  type="date"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none border-none"
                  value={form.due_date}
                  onChange={e => set('due_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
              Images {hasAnyImage && `· ${existingImages.length + newFiles.length}`}
            </label>

            <div className="flex flex-wrap gap-2">
              {/* Existing images */}
              {existingImages.map(img => (
                <div key={img.id} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-600 shrink-0">
                  <img src={img.image_path} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(img.id)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* New files preview */}
              {newFiles.map((file, idx) => (
                <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-blue-600/60 shrink-0">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {/* "new" badge */}
                  <span className="absolute bottom-0.5 left-0.5 text-[9px] font-bold bg-blue-500 text-white px-1 rounded">new</span>
                </div>
              ))}

              {/* Add button */}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 gap-0.5">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] text-slate-600">Add</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAddFiles}
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-500 text-sm font-semibold text-slate-950 hover:bg-blue-400 active:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-900/40"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </span>
              ) : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
