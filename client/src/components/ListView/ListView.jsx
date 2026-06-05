import { useState } from 'react'

const PRIORITY = {
  high:   { label: 'High',   cls: 'bg-red-500 text-white',           emoji: '🔥' },
  medium: { label: 'Med',    cls: 'bg-amber-500 text-white',         emoji: '⚡' },
  low:    { label: 'Low',    cls: 'bg-emerald-500 text-white',       emoji: '🌿' },
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i
function isImage(path) { return path && IMAGE_EXT.test(path) }

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
]
function getColor(name) {
  let n = 0
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

// ─── Sort logic ───────────────────────────────────────────────
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const STATUS_ORDER   = { todo: 0, in_progress: 1, review: 2, done: 3 }

function getValue(task, field) {
  if (field === 'priority')   return PRIORITY_ORDER[task.priority] ?? 1
  if (field === 'status')     return STATUS_ORDER[task.status] ?? 0
  if (field === 'due_date')   return task.due_date ? new Date(task.due_date).getTime() : Infinity
  if (field === 'created_at') return new Date(task.created_at).getTime()
  if (field === 'title')      return task.title?.toLowerCase() ?? ''
  return 0
}

function cmp(a, b, field, dir) {
  const av = getValue(a, field)
  const bv = getValue(b, field)
  // Tasks without due_date always go to end regardless of direction
  if (field === 'due_date') {
    if (av === Infinity && bv === Infinity) return 0
    if (av === Infinity) return 1
    if (bv === Infinity) return -1
  }
  if (av < bv) return dir === 'asc' ? -1 : 1
  if (av > bv) return dir === 'asc' ? 1 : -1
  return 0
}

function sortTasks(tasks, primary, primaryDir, secondary, secondaryDir) {
  return [...tasks].sort((a, b) => {
    const r = cmp(a, b, primary, primaryDir)
    return r !== 0 ? r : cmp(a, b, secondary, secondaryDir)
  })
}

// ─── Sort bar ─────────────────────────────────────────────────
const SORT_FIELDS = [
  { value: 'priority',   label: 'Urgency'   },
  { value: 'due_date',   label: 'Due Date'  },
  { value: 'status',     label: 'Status'    },
  { value: 'created_at', label: 'Created'   },
  { value: 'title',      label: 'Title'     },
]

function SortPill({ field, dir, onChange, label, accentColor }) {
  const fieldLabel = SORT_FIELDS.find(f => f.value === field)?.label ?? field
  const isAsc = dir === 'asc'

  const toggleDir = () => onChange(field, isAsc ? 'desc' : 'asc')

  return (
    <div className={`flex items-center rounded-xl border overflow-hidden text-xs font-medium ${accentColor}`}>
      {/* Field selector */}
      <div className="relative">
        <select
          value={field}
          onChange={e => onChange(e.target.value, dir)}
          className="appearance-none bg-transparent pl-2.5 pr-6 py-1.5 cursor-pointer focus:outline-none"
        >
          {SORT_FIELDS.map(f => (
            <option key={f.value} value={f.value} className="bg-slate-800 text-slate-200">
              {f.label}
            </option>
          ))}
        </select>
        <svg className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {/* Direction toggle */}
      <button
        onClick={toggleDir}
        className="px-2 py-1.5 border-l border-current/20 hover:bg-white/10 transition-colors flex items-center gap-0.5"
        title={isAsc ? 'Ascending' : 'Descending'}
      >
        <svg className={`w-3 h-3 transition-transform ${isAsc ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  )
}

const MAX_SHOW = 4

export default function ListView({ tasks, onRowClick, onDelete }) {
  const [primary,    setPrimary]    = useState('priority')
  const [primaryDir, setPrimaryDir] = useState('asc')
  const [secondary,    setSecondary]    = useState('due_date')
  const [secondaryDir, setSecondaryDir] = useState('asc')

  const sorted = sortTasks(tasks, primary, primaryDir, secondary, secondaryDir)

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-slate-600">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="text-sm">No tasks yet</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Sort bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 shrink-0">Sort by</span>
        <SortPill
          field={primary} dir={primaryDir}
          onChange={(f, d) => { setPrimary(f); setPrimaryDir(d) }}
          accentColor="border-blue-700 text-blue-300 bg-blue-950/50"
        />
        <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <span className="text-xs text-slate-500 shrink-0">then</span>
        <SortPill
          field={secondary} dir={secondaryDir}
          onChange={(f, d) => { setSecondary(f); setSecondaryDir(d) }}
          accentColor="border-slate-600 text-slate-400 bg-slate-800/50"
        />
      </div>

      {/* Cards */}
      {sorted.map(task => {
        const p = PRIORITY[task.priority] ?? PRIORITY.medium
        const isOverdue = task.due_date && new Date(task.due_date) < new Date()
        const images = task.task_images?.length > 0
          ? task.task_images.map(i => i.image_path)
          : (isImage(task.attachment_path) ? [task.attachment_path] : [])
        const visible = images.slice(0, MAX_SHOW)
        const extra   = images.length - MAX_SHOW

        return (
          <div
            key={task.id}
            onClick={() => onRowClick(task)}
            className="group relative bg-slate-800 rounded-2xl border border-slate-700 p-4 cursor-pointer hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-150 select-none"
          >
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(task.id) }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-red-950 hover:text-red-400 transition-all z-10 text-xs leading-none"
              >✕</button>
            )}

            <div className="flex items-start justify-between gap-2 mb-1.5 pr-6">
              <h3 className="text-[15px] font-bold text-slate-100 leading-snug">{task.title}</h3>
              <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.cls}`}>
                {p.emoji} {p.label}
              </span>
            </div>

            {task.description && (
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">{task.description}</p>
            )}

            {visible.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-hidden">
                {visible.map((src, i) => (
                  <div key={i} className="relative shrink-0 rounded-xl overflow-hidden">
                    <img src={src} alt="" className="h-28 w-auto max-w-[150px] object-cover" loading="lazy" />
                    {i === visible.length - 1 && extra > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                        +{extra}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(task.engineer || task.due_date) && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
                {task.engineer ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-600 text-xs text-slate-300 font-medium">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${getColor(task.engineer.name)} shrink-0`} />
                    {task.engineer.name}
                  </span>
                ) : <span />}
                {task.due_date && (
                  <span className={`text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                    {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
