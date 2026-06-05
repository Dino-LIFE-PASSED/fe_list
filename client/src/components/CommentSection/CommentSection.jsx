import { useState, useRef } from 'react'

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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function Avatar({ name, avatarPath }) {
  if (avatarPath) {
    return <img src={avatarPath} alt="" className="w-full h-full object-cover" />
  }
  return name ? name[0].toUpperCase() : '?'
}

function CommentBubble({ comment, onDelete, onImageClick }) {
  const { user, engineer, body, image_path, created_at } = comment
  const hasImage = image_path && IMAGE_EXT.test(image_path)

  // ใช้ user.username ก่อน ถ้าไม่มีค่อย fallback ไป engineer (comment เก่า)
  const displayName = user?.username ?? engineer?.name ?? 'Unknown'
  const avatarPath   = engineer?.avatar_path ?? null

  return (
    <div className="group flex gap-3">
      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getColor(displayName)} flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0 mt-0.5`}>
        <Avatar name={displayName} avatarPath={avatarPath} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-300">{displayName}</span>
          <span className="text-[10px] text-slate-600">{timeAgo(created_at)}</span>
          <button
            onClick={() => onDelete(comment.id)}
            className="ml-auto opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 transition-all text-xs"
          >✕</button>
        </div>

        <div className="bg-slate-900/60 rounded-xl rounded-tl-sm border border-slate-700/60 overflow-hidden">
          {body && (
            <p className="text-sm text-slate-300 leading-relaxed px-3.5 py-2.5 whitespace-pre-wrap">{body}</p>
          )}
          {body && hasImage && (
            <div className="flex items-center gap-2 px-3.5">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-[10px] text-slate-600 shrink-0">attachment</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>
          )}
          {hasImage && (
            <div className="w-full overflow-hidden" style={{ maxHeight: 400 }}>
              <img
                src={image_path}
                alt=""
                className="w-full h-auto block cursor-zoom-in"
                style={{ maxHeight: 400, objectFit: 'contain' }}
                loading="lazy"
                onClick={() => onImageClick?.(image_path)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentSection({ comments, loading, add, remove, onImageClick }) {
  const [body, setBody]           = useState('')
  const [image, setImage]         = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  const canSubmit = body.trim() || image

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    const fd = new FormData()
    if (body.trim()) fd.append('body', body.trim())
    if (image) fd.append('image', image)
    await add(fd)
    setBody('')
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Comments {comments.length > 0 && `· ${comments.length}`}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map(c => (
            <CommentBubble key={c.id} comment={c} onDelete={remove} onImageClick={onImageClick} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-600 text-center py-2">No comments yet</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 pt-1">
        <textarea
          rows={2}
          placeholder="Write a comment..."
          value={body}
          onChange={e => setBody(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
        />

        {image && (
          <div className="relative rounded-xl overflow-hidden border border-slate-700">
            <img src={URL.createObjectURL(image)} alt="" className="w-full max-h-40 object-cover" />
            <button
              type="button"
              onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = '' }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
            >✕</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {image ? image.name.slice(0, 20) + (image.name.length > 20 ? '…' : '') : 'Attach image'}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files[0] || null)} />
          </label>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-semibold transition-colors"
          >
            {submitting
              ? <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            }
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
