import { useState, useEffect } from 'react'
import { getLogs } from '../../api'

const URGENCY = {
  critical: { label: 'Critical', dot: 'bg-red-500',    text: 'text-red-400',    badge: 'bg-red-950/60 text-red-300 border-red-800',    order: 0 },
  high:     { label: 'High',     dot: 'bg-amber-400',  text: 'text-amber-400',  badge: 'bg-amber-950/60 text-amber-300 border-amber-800', order: 1 },
  medium:   { label: 'Medium',   dot: 'bg-blue-400',   text: 'text-blue-400',   badge: 'bg-blue-950/60 text-blue-300 border-blue-800',   order: 2 },
  low:      { label: 'Low',      dot: 'bg-slate-500',  text: 'text-slate-500',  badge: 'bg-slate-800 text-slate-400 border-slate-700',   order: 3 },
}

const ACTION_META = {
  task_created:   { icon: '✦', label: 'Created task',        color: 'text-blue-400'    },
  task_updated:   { icon: '✎', label: 'Updated task',        color: 'text-slate-400'   },
  status_changed: { icon: '⇄', label: 'Changed status',      color: 'text-amber-400'   },
  task_deleted:   { icon: '✕', label: 'Deleted task',        color: 'text-red-400'     },
  comment_added:  { icon: '💬', label: 'Commented on',       color: 'text-slate-400'   },
  user_created:   { icon: '＋', label: 'Created user',       color: 'text-emerald-400' },
  user_updated:   { icon: '✎', label: 'Updated user',        color: 'text-slate-400'   },
  user_deleted:   { icon: '✕', label: 'Deleted user',        color: 'text-red-400'     },
}

const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' }

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(logs) {
  const groups = {}
  logs.forEach(log => {
    const key = new Date(log.created_at).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  })
  return Object.entries(groups).map(([key, items]) => ({
    dateLabel: formatDate(items[0].created_at),
    items: [...items].sort((a, b) => {
      const urgencyDiff = (URGENCY[a.urgency]?.order ?? 3) - (URGENCY[b.urgency]?.order ?? 3)
      if (urgencyDiff !== 0) return urgencyDiff
      return new Date(b.created_at) - new Date(a.created_at)
    }),
  }))
}

function LogEntry({ log }) {
  const u = URGENCY[log.urgency] ?? URGENCY.low
  const a = ACTION_META[log.action] ?? { icon: '•', label: log.action, color: 'text-slate-400' }

  const description = log.action === 'status_changed' && log.meta?.to_status
    ? `→ ${STATUS_LABEL[log.meta.to_status] ?? log.meta.to_status}`
    : null

  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-slate-800/50 transition-colors group">
      {/* Urgency dot */}
      <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
        <span className={`w-2 h-2 rounded-full ${u.dot}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className={`text-sm ${a.color} shrink-0`}>{a.icon}</span>
            <span className="text-xs text-slate-500 shrink-0">{a.label}</span>
            {log.entity_title && (
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                {log.entity_title}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500">{description}</span>
            )}
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${u.badge}`}>
            {u.label}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {log.user && (
            <span className="text-[10px] text-slate-600 font-medium">{log.user.username}</span>
          )}
          <span className="text-[10px] text-slate-700">{formatTime(log.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ActivityLog() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLogs().then(({ data }) => { setLogs(data); setLoading(false) })
  }, [])

  const groups = groupByDate(logs)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-100">Activity Log</h2>
        <p className="text-xs text-slate-500 mt-0.5">Sorted by urgency within each day</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 px-1 flex-wrap">
        {Object.entries(URGENCY).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${val.dot}`} />
            <span className="text-xs text-slate-500">{val.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-slate-600">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm">No activity yet</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ dateLabel, items }) => (
            <div key={dateLabel} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              {/* Date header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/80">
                <span className="text-sm font-bold text-slate-200">{dateLabel}</span>
                <span className="text-xs text-slate-500">{items.length} event{items.length !== 1 ? 's' : ''}</span>
              </div>
              {/* Entries */}
              <div className="divide-y divide-slate-700/50">
                {items.map(log => <LogEntry key={log.id} log={log} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
