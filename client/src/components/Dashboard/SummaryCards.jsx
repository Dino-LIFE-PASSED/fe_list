const CARDS = [
  {
    key: 'todo',
    label: 'To Do',
    shortLabel: 'Todo',
    accent: '#1c1d00',
    accentBar: '#e2e600',
    cellBg: 'bg-slate-700/40',
    stripIconColor: '#64748b',
    stripNumColor: 'text-slate-300',
    stripLabelColor: '#475569',
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    numColor: 'text-slate-950',
    labelColor: 'text-slate-800',
    subColor: 'text-slate-700',
    trackColor: 'bg-black/15',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    shortLabel: 'Active',
    accent: '#e2e600',
    accentBar: '#e2e600',
    cellBg: 'bg-blue-500/10',
    bg: 'bg-blue-950',
    border: 'border-blue-700',
    numColor: 'text-blue-300',
    labelColor: 'text-slate-400',
    subColor: 'text-slate-500',
    trackColor: 'bg-black/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'review',
    label: 'In Review',
    shortLabel: 'Review',
    accent: '#fbbf24',
    accentBar: '#fbbf24',
    cellBg: 'bg-amber-500/10',
    bg: 'bg-amber-950',
    border: 'border-amber-700',
    numColor: 'text-amber-300',
    labelColor: 'text-slate-400',
    subColor: 'text-slate-500',
    trackColor: 'bg-black/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    key: 'done',
    label: 'Done',
    shortLabel: 'Done',
    accent: '#34d399',
    accentBar: '#34d399',
    cellBg: 'bg-emerald-500/10',
    bg: 'bg-emerald-950',
    border: 'border-emerald-700',
    numColor: 'text-emerald-300',
    labelColor: 'text-slate-400',
    subColor: 'text-slate-500',
    trackColor: 'bg-black/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function SummaryCards({ summary }) {
  const total = Object.values(summary).reduce((a, b) => a + b, 0)

  return (
    <>
      {/* ── Mobile: compact strip ── */}
      <div className="md:hidden bg-slate-800 rounded-2xl border border-slate-700 mb-4 overflow-hidden">
        <div className="grid grid-cols-4">
          {CARDS.map(({ key, shortLabel, accentBar, numColor, cellBg, stripIconColor, stripNumColor, stripLabelColor, icon }) => {
            const count = summary[key] ?? 0
            const iconColor  = stripIconColor  ?? accentBar
            const labelColor = stripLabelColor ?? accentBar
            const mNumColor  = stripNumColor   ?? numColor
            return (
              <div key={key} className={`flex flex-col items-center pt-4 pb-3 px-1 gap-1 ${cellBg}`}>
                <span style={{ color: iconColor }}>{icon}</span>
                <span className={`text-2xl font-bold leading-none ${mNumColor}`}>{count}</span>
                <span className="text-[10px] font-semibold mt-0.5" style={{ color: labelColor, opacity: 0.75 }}>
                  {shortLabel}
                </span>
              </div>
            )
          })}
        </div>

        {/* Proportional color bar */}
        <div className="flex h-1">
          {CARDS.map(({ key, accentBar }) => {
            const count = summary[key] ?? 0
            const pct = total > 0 ? (count / total) * 100 : 25
            return (
              <div
                key={key}
                className="transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: accentBar, opacity: count === 0 ? 0.12 : 0.7 }}
              />
            )
          })}
        </div>
      </div>

      {/* ── Desktop: full cards ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {CARDS.map(({ key, label, accent, bg, border, numColor, labelColor, subColor, trackColor, icon }) => {
          const count = summary[key] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={key} className={`${bg} rounded-2xl border ${border} p-5 flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
                <span className="p-1.5 rounded-lg bg-black/15" style={{ color: accent }}>
                  {icon}
                </span>
              </div>
              <div className={`text-3xl font-bold tracking-tight ${numColor}`}>{count}</div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${trackColor} overflow-hidden`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: accent }}
                  />
                </div>
                <p className={`text-xs ${subColor}`}>{pct}% of total</p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
