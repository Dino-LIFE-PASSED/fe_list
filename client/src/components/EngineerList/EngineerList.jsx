const STATUS_DOT = {
  working: 'bg-emerald-400',
  away:    'bg-amber-400',
  offline: 'bg-slate-500',
}

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

function PencilIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

export default function EngineerList({ engineers, selectedId, onSelect, onAdd, onEdit }) {
  return (
    <div className="flex flex-col gap-0.5">

      {/* Section header */}
      <div className="flex items-center justify-between px-3 mb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Team</p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-all"
            title="Add engineer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* All Engineers */}
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left transition-all ${
          !selectedId
            ? 'bg-white/10 text-white font-medium'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span>All Engineers</span>
      </button>

      {/* Engineer items */}
      {engineers.map(e => (
        <div key={e.id} className="group relative flex items-center">
          <button
            onClick={() => onSelect(e.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left transition-all ${
              selectedId === e.id
                ? 'bg-white/10 text-white font-medium'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <div className="relative shrink-0">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getColor(e.name)} flex items-center justify-center text-xs font-bold text-white overflow-hidden`}>
                {e.avatar_path
                  ? <img src={e.avatar_path} alt={e.name} className="w-full h-full object-cover" />
                  : e.name[0].toUpperCase()}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${STATUS_DOT[e.status] ?? STATUS_DOT.offline}`} />
            </div>
            <span className="truncate">{e.name}</span>
          </button>

          {/* Edit button — show on hover */}
          {onEdit && (
            <button
              onClick={() => onEdit(e)}
              className="absolute right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-all"
              title="Edit engineer"
            >
              <PencilIcon />
            </button>
          )}
        </div>
      ))}

      {engineers.length === 0 && (
        <p className="text-xs text-slate-600 px-3 py-1">No engineers yet</p>
      )}
    </div>
  )
}
