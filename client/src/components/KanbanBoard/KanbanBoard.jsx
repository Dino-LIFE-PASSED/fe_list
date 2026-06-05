import { useState, useRef, useEffect, useCallback } from 'react'
import JobCard from '../JobCard/JobCard'

const COLUMNS = [
  { key: 'todo',        label: 'To Do',       color: '#e2e600', labelColor: 'text-blue-300',   bg: 'bg-blue-500/15',        ring: 'ring-blue-500'    },
  { key: 'in_progress', label: 'In Progress', color: '#e2e600', labelColor: 'text-blue-300',    bg: 'bg-blue-950/60',        ring: 'ring-blue-500'    },
  { key: 'review',      label: 'Review',      color: '#fbbf24', labelColor: 'text-amber-300',   bg: 'bg-amber-950/50',       ring: 'ring-amber-500'   },
  { key: 'done',        label: 'Done',        color: '#34d399', labelColor: 'text-emerald-300', bg: 'bg-emerald-950/50',     ring: 'ring-emerald-500' },
]

function Column({ col, tasks, onCardClick, onDelete, isOver, onDragOver, onDragLeave, onDrop, canDrag, colRef, touchOver, onTouchStartCard, touchDragging }) {
  return (
    <div
      ref={colRef}
      data-column={col.key}
      onDragOver={canDrag ? onDragOver : undefined}
      onDragLeave={canDrag ? onDragLeave : undefined}
      onDrop={canDrag ? onDrop : undefined}
      className={`rounded-2xl border-2 transition-all duration-150 ${
        (isOver || touchOver) ? `${col.ring} ring-2 ring-offset-1 ring-offset-slate-900 border-transparent` : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
          <span className={`text-sm font-semibold ${col.labelColor}`}>{col.label}</span>
        </div>
        <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-slate-700/80 text-slate-400">
          {tasks.length}
        </span>
      </div>

      <div className={`rounded-xl ${col.bg} p-2 min-h-[200px] flex flex-col gap-2 ${(isOver || touchOver) ? 'opacity-75' : ''}`}>
        {tasks.map(task => (
          <div
            key={task.id}
            draggable={canDrag}
            onDragStart={canDrag ? (e => { e.dataTransfer.setData('taskId', task.id); e.dataTransfer.effectAllowed = 'move' }) : undefined}
            onTouchStart={canDrag ? () => onTouchStartCard(task.id) : undefined}
            className={`${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${touchDragging === task.id ? 'opacity-50 scale-95' : ''} transition-all duration-100`}
          >
            <JobCard task={task} onClick={onCardClick} onDelete={onDelete} />
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-slate-600">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span className="text-xs">Drop here</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, onCardClick, onDelete, onStatusChange, canDrag = true }) {
  const [dragOver, setDragOver] = useState(null)

  // Touch drag state
  const [touchDragging, setTouchDragging] = useState(null) // taskId being dragged
  const [touchOver, setTouchOver]         = useState(null) // column key being hovered
  const colRefs = useRef({})             // refs to column DOM elements
  const touchMoved = useRef(false)

  const handleDrop = (e, key) => {
    e.preventDefault()
    setDragOver(null)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) onStatusChange(taskId, key)
  }

  // Find which column key contains a given touch point
  const getColumnAtPoint = useCallback((x, y) => {
    for (const [key, el] of Object.entries(colRefs.current)) {
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return key
      }
    }
    return null
  }, [])

  // Add non-passive touchmove/touchend to window when dragging
  useEffect(() => {
    if (!touchDragging) return

    const onTouchMove = (e) => {
      touchMoved.current = true
      const touch = e.touches[0]
      const col = getColumnAtPoint(touch.clientX, touch.clientY)
      setTouchOver(col)
      // Prevent scroll only when clearly dragging horizontally
      const dx = Math.abs(touch.clientX - (window._touchStartX ?? touch.clientX))
      const dy = Math.abs(touch.clientY - (window._touchStartY ?? touch.clientY))
      if (dx > dy) e.preventDefault()
    }

    const onTouchEnd = (e) => {
      if (touchMoved.current && touchOver) {
        onStatusChange(touchDragging, touchOver)
      }
      setTouchDragging(null)
      setTouchOver(null)
      touchMoved.current = false
    }

    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [touchDragging, touchOver, getColumnAtPoint, onStatusChange])

  const handleTouchStartCard = useCallback((taskId) => {
    if (!canDrag) return
    touchMoved.current = false
    setTouchDragging(taskId)
  }, [canDrag])

  const renderColumns = (isMobile) =>
    COLUMNS.map(col => {
      const colTasks = tasks.filter(t => t.status === col.key)
      const refKey = isMobile ? `m_${col.key}` : `d_${col.key}`
      return (
        <Column
          key={col.key}
          col={col}
          tasks={colTasks}
          onCardClick={onCardClick}
          onDelete={onDelete}
          isOver={dragOver === col.key}
          touchOver={touchOver === col.key}
          onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
          onDragLeave={() => setDragOver(null)}
          onDrop={e => handleDrop(e, col.key)}
          canDrag={canDrag}
          colRef={el => { colRefs.current[refKey] = el }}
          onTouchStartCard={handleTouchStartCard}
          touchDragging={touchDragging}
        />
      )
    })

  return (
    <>
      {/* ── Mobile: horizontal scroll ── */}
      <div className="md:hidden overflow-x-auto pb-3">
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} style={{ width: '76vw', maxWidth: 320, minWidth: 260 }}>
                <Column
                  col={col}
                  tasks={colTasks}
                  onCardClick={onCardClick}
                  onDelete={onDelete}
                  isOver={dragOver === col.key}
                  touchOver={touchOver === col.key}
                  onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, col.key)}
                  canDrag={canDrag}
                  colRef={el => { colRefs.current[`m_${col.key}`] = el }}
                  onTouchStartCard={handleTouchStartCard}
                  touchDragging={touchDragging}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Desktop: grid ── */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <Column
              key={col.key}
              col={col}
              tasks={colTasks}
              onCardClick={onCardClick}
              onDelete={onDelete}
              isOver={dragOver === col.key}
              touchOver={false}
              onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, col.key)}
              canDrag={canDrag}
              colRef={el => { colRefs.current[`d_${col.key}`] = el }}
              onTouchStartCard={handleTouchStartCard}
              touchDragging={touchDragging}
            />
          )
        })}
      </div>
    </>
  )
}
