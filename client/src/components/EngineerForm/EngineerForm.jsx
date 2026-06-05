import { useState, useRef } from 'react'

const STATUS_OPTIONS = [
  { value: 'working', label: 'Working', dot: 'bg-emerald-400' },
  { value: 'away',    label: 'Away',    dot: 'bg-amber-400'   },
  { value: 'offline', label: 'Offline', dot: 'bg-slate-500'   },
]

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

function CameraIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

export default function EngineerForm({ engineer, onSubmit, onClose, onDelete }) {
  const [name, setName]           = useState(engineer?.name ?? '')
  const [status, setStatus]       = useState(engineer?.status ?? 'offline')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview]     = useState(engineer?.avatar_path ?? null)
  const fileRef = useRef()

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('status', status)
    if (avatarFile) fd.append('avatar', avatarFile)
    onSubmit(fd)
  }

  const initials   = name.trim() ? name.trim()[0].toUpperCase() : '?'
  const avatarColor = name.trim() ? getColor(name.trim()) : 'from-slate-600 to-slate-700'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-slate-800 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl shadow-black/40 max-h-[92dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 sm:pt-6 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {engineer ? 'Edit Engineer' : 'Add Engineer'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {engineer ? 'Update team member details' : 'Add a new team member'}
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

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">

          {/* Avatar picker */}
          <div className="flex justify-center">
            <label className="cursor-pointer group relative">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-2xl font-bold text-white overflow-hidden ring-2 ring-slate-700`}>
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <CameraIcon />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Name *
            </label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Engineer name"
              className={inputCls}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    status === opt.value
                      ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 pb-2">
            {engineer && onDelete && (
              <button
                type="button"
                onClick={() => { onDelete(engineer.id); onClose() }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-500 text-sm font-semibold text-slate-950 hover:bg-blue-400 active:bg-blue-600 transition-colors shadow-md shadow-blue-900/40"
            >
              {engineer ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
