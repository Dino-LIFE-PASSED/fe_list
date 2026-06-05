import { useState } from 'react'
import CommentSection from '../CommentSection/CommentSection'
import Lightbox from '../Lightbox/Lightbox'
import { useComments } from '../../hooks/useComments'

const STATUS = {
  todo:        { label: 'Todo',        class: 'bg-slate-700 text-slate-200',        dot: 'bg-slate-400'    },
  in_progress: { label: 'In Progress', class: 'bg-blue-900/80 text-blue-300',       dot: 'bg-blue-400'     },
  review:      { label: 'Review',      class: 'bg-amber-900/80 text-amber-300',     dot: 'bg-amber-400'    },
  done:        { label: 'Done',        class: 'bg-emerald-900/80 text-emerald-300', dot: 'bg-emerald-400'  },
}

const PRIORITY = {
  high:   { label: 'High',   class: 'bg-red-900/70 text-red-300 border border-red-700'         },
  medium: { label: 'Medium', class: 'bg-amber-900/70 text-amber-300 border border-amber-700'   },
  low:    { label: 'Low',    class: 'bg-emerald-900/70 text-emerald-300 border border-emerald-700' },
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i

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

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  )
}

export default function TaskPreview({ task, engineers, onEdit, onDelete, onClose, canEdit = true, canDelete = true, canApprove = true }) {
  const [lightbox, setLightbox] = useState(null)
  const { comments, loading: commentsLoading, add: addComment, remove: removeComment } = useComments(task.id)

  const s = STATUS[task.status] ?? STATUS.todo
  const p = PRIORITY[task.priority] ?? PRIORITY.medium
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  const hasImage = IMAGE_EXT.test(task.attachment_path ?? '')
  const filename = task.attachment_path?.split('/').pop()

  const taskImageSrcs = (task.task_images ?? []).map(i => i.image_path)
  const legacySrc = hasImage && !taskImageSrcs.length ? [task.attachment_path] : []
  const allImages = [
    ...taskImageSrcs,
    ...legacySrc,
    ...comments.filter(c => c.image_path && IMAGE_EXT.test(c.image_path)).map(c => c.image_path),
  ]

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl shadow-black/50 max-h-[92dvh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>


        {/* Scrollable body */}
        <div className="flex flex-col gap-5 px-6 pt-5 pb-6 overflow-y-auto">

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.class}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.class}`}>
              {p.label} Priority
            </span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-100 leading-snug">{task.title}</h2>
            {task.description && (
              <p className="text-sm text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-col gap-2.5">
            {task.engineer && (
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getColor(task.engineer.name)} flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0`}>
                  {task.engineer.avatar_path
                    ? <img src={task.engineer.avatar_path} alt="" className="w-full h-full object-cover" />
                    : task.engineer.name[0].toUpperCase()}
                </div>
                <span className="text-sm text-slate-300">{task.engineer.name}</span>
              </div>
            )}

            {task.due_date && (
              <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                <CalendarIcon />
                <span>
                  {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {isOverdue && <span className="ml-1.5 text-xs font-semibold text-red-400">Overdue</span>}
                </span>
              </div>
            )}

            {/* Non-image attachment — show filename only */}
            {task.attachment_path && !hasImage && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <PaperclipIcon />
                <span className="truncate">{filename}</span>
              </div>
            )}

            {/* Images — thumbnail strip, click to lightbox */}
            {allImages.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <PaperclipIcon />
                  <span>Images · {allImages.length}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {allImages.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(src)}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 hover:ring-2 hover:ring-blue-500/30 transition-all cursor-zoom-in shrink-0"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-700" />

          {/* Comments */}
          <CommentSection
            comments={comments}
            loading={commentsLoading}
            add={addComment}
            remove={removeComment}
            onImageClick={setLightbox}
          />

          {/* Divider */}
          <div className="h-px bg-slate-700" />

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            {canDelete ? (
              <button
                onClick={() => { onDelete(task.id); onClose() }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            ) : <span />}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-sm font-semibold transition-colors shadow-md shadow-blue-900/40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  )
}
