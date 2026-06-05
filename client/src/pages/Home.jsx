import { useState, useEffect } from 'react'
import SummaryCards from '../components/Dashboard/SummaryCards'
import KanbanBoard from '../components/KanbanBoard/KanbanBoard'
import ListView from '../components/ListView/ListView'
import JobForm from '../components/JobForm/JobForm'
import TaskPreview from '../components/TaskPreview/TaskPreview'
import EngineerList from '../components/EngineerList/EngineerList'
import EngineerForm from '../components/EngineerForm/EngineerForm'
import UserManagement from '../components/UserManagement/UserManagement'
import ActivityLog from '../components/ActivityLog/ActivityLog'
import { useTasks } from '../hooks/useTasks'
import { useEngineers } from '../hooks/useEngineers'
import { useAuth } from '../context/AuthContext'

function KanbanIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

export default function Home() {
  const [view, setView] = useState('kanban')
  const [selectedEngineerId, setSelectedEngineerId] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [previewTask, setPreviewTask] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showEngineerForm, setShowEngineerForm] = useState(false)
  const [editingEngineer, setEditingEngineer] = useState(null)
  const [showUserMgmt, setShowUserMgmt] = useState(false)

  const { user, can, canEditTask, canSetStatus, logout } = useAuth()

  const filters = selectedEngineerId ? { engineer_id: selectedEngineerId } : {}
  const { tasks, summary, loading, add, update, remove } = useTasks(filters)
  const { engineers, add: addEngineer, update: updateEngineer, remove: removeEngineer } = useEngineers()

  const selectedEngineer = engineers.find(e => e.id === selectedEngineerId)

  // close sidebar on route-like navigation on mobile
  useEffect(() => {
    if (sidebarOpen) setSidebarOpen(false)
  }, [selectedEngineerId])

  // prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const handleCardClick = task => setPreviewTask(task)

  const handleEditFromPreview = () => {
    setEditingTask(previewTask)
    setPreviewTask(null)
    setShowForm(true)
  }

  const handleFormSubmit = async fd => {
    editingTask ? await update(editingTask.id, fd) : await add(fd)
    setShowForm(false)
    setEditingTask(null)
  }

  const handleEngineerSubmit = async (fd) => {
    if (editingEngineer) {
      await updateEngineer(editingEngineer.id, fd)
    } else {
      await addEngineer(fd)
    }
    setShowEngineerForm(false)
    setEditingEngineer(null)
  }

  const handleEngineerEdit = (engineer) => {
    setEditingEngineer(engineer)
    setShowEngineerForm(true)
  }

  const handleStatusChange = async (taskId, status) => {
    if (!canSetStatus(status)) return
    const fd = new FormData()
    fd.append('status', status)
    await update(taskId, fd)
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <img src="/logo_fe.png" alt="Logo" className="w-9 h-9 rounded-xl object-cover shrink-0 ring-2 ring-slate-700" />
        <div>
          <p className="text-sm font-bold text-white leading-none">JobTracker</p>
          <p className="text-[10px] text-slate-500 mt-0.5">FE Engineer</p>
        </div>
      </div>

      <div className="h-px bg-slate-800/80 mx-4" />

      <nav className="px-3 py-4 flex flex-col gap-1">
        <button
          onClick={() => setView('kanban')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left w-full transition-all ${view !== 'log' ? 'text-white bg-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
        {can('manageUsers') && (
          <button
            onClick={() => setView('log')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left w-full transition-all ${view === 'log' ? 'text-white bg-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Activity Log
          </button>
        )}
      </nav>

      <div className="h-px bg-slate-800/80 mx-4" />

      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <EngineerList
          engineers={engineers}
          selectedId={selectedEngineerId}
          onSelect={setSelectedEngineerId}
          onAdd={() => { setEditingEngineer(null); setShowEngineerForm(true) }}
          onEdit={handleEngineerEdit}
        />
      </div>

      <div className="px-3 py-3 border-t border-slate-800 flex flex-col gap-1">
        {can('manageUsers') && (
          <button
            onClick={() => setShowUserMgmt(true)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all w-full text-left"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all w-full text-left"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="flex-1 truncate">{user?.username}</span>
          <span className="text-[10px] font-semibold text-slate-600 shrink-0">{user?.role?.replace('_', ' ')}</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-900">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-slate-950 border-r border-slate-800 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 flex flex-col bg-slate-950 border-r border-slate-800 h-full shadow-2xl z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 h-14 md:h-16 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-700 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold text-slate-100 truncate">
                {selectedEngineer ? selectedEngineer.name : 'All Tasks'}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle */}
            <div className="hidden sm:flex items-center bg-slate-900 rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'kanban' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <KanbanIcon /> Kanban
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ListIcon /> List
              </button>
            </div>

            {/* View toggle — icon only on mobile */}
            <button
              onClick={() => setView(v => v === 'kanban' ? 'list' : 'kanban')}
              className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-slate-700 text-slate-300"
              title={view === 'kanban' ? 'Switch to List' : 'Switch to Kanban'}
            >
              {view === 'kanban' ? <ListIcon /> : <KanbanIcon />}
            </button>

            {/* New task button — super_user + manager only */}
            {can('createTask') && (
              <button
                onClick={() => { setEditingTask(null); setShowForm(true) }}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-slate-950 text-sm font-semibold px-3 md:px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-900/50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Task</span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-3 md:p-6">
          <SummaryCards summary={summary} />

          {view === 'log' ? (
            <ActivityLog />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm">Loading tasks...</span>
            </div>
          ) : view === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onCardClick={handleCardClick}
              onDelete={can('deleteTask') ? remove : null}
              onStatusChange={handleStatusChange}
              canDrag={can('changeStatus')}
            />
          ) : (
            <ListView
              tasks={tasks}
              onRowClick={handleCardClick}
              onDelete={can('deleteTask') ? remove : null}
            />
          )}
        </main>
      </div>

      {previewTask && (
        <TaskPreview
          task={previewTask}
          engineers={engineers}
          onEdit={handleEditFromPreview}
          onDelete={remove}
          onClose={() => setPreviewTask(null)}
          canEdit={canEditTask(previewTask)}
          canDelete={can('deleteTask')}
          canApprove={can('approveTask')}
        />
      )}

      {showForm && (
        <JobForm
          task={editingTask}
          engineers={engineers}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
        />
      )}

      {showEngineerForm && (
        <EngineerForm
          engineer={editingEngineer}
          onSubmit={handleEngineerSubmit}
          onDelete={removeEngineer}
          onClose={() => { setShowEngineerForm(false); setEditingEngineer(null) }}
        />
      )}

      {showUserMgmt && (
        <UserManagement
          engineers={engineers}
          onClose={() => setShowUserMgmt(false)}
        />
      )}
    </div>
  )
}
