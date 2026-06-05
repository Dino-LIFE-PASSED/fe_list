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
  'from-pink-500 to-rose-500',
]

function getColor(name) {
  let n = 0
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

const MAX_SHOW = 3

export default function JobCard({ task, onClick, onDelete }) {
  const { title, description, priority, due_date, engineer, task_images = [], attachment_path } = task
  const p = PRIORITY[priority] ?? PRIORITY.medium
  const isOverdue = due_date && new Date(due_date) < new Date()

  const images = task_images.length > 0
    ? task_images.map(i => i.image_path)
    : (isImage(attachment_path) ? [attachment_path] : [])
  const visible = images.slice(0, MAX_SHOW)
  const extra = images.length - MAX_SHOW

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative bg-slate-800 rounded-2xl border border-slate-700 p-4 cursor-pointer hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-150 select-none"
    >
      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(task.id) }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-red-950 hover:text-red-400 transition-all z-10 text-xs leading-none"
      >✕</button>

      {/* Title + Priority */}
      <div className="flex items-start justify-between gap-2 mb-1.5 pr-6">
        <h3 className="text-[15px] font-bold text-slate-100 leading-snug">{title}</h3>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.cls}`}>
          {p.emoji} {p.label}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">{description}</p>
      )}

      {/* Images */}
      {visible.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-hidden">
          {visible.map((src, i) => (
            <div key={i} className="relative shrink-0 rounded-xl overflow-hidden">
              <img src={src} alt="" draggable="false" className="h-28 w-auto max-w-[130px] object-cover pointer-events-none" loading="lazy" />
              {i === visible.length - 1 && extra > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                  +{extra}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {(engineer || due_date) && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
          {engineer ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-600 text-xs text-slate-300 font-medium truncate max-w-[150px]">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${getColor(engineer.name)} shrink-0`} />
              {engineer.name}
            </span>
          ) : <span />}
          {due_date && (
            <span className={`text-xs font-medium shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
              {new Date(due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
