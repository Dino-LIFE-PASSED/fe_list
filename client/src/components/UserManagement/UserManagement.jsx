import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../../api'

const ROLES = [
  { value: 'super_user', label: 'Super User', cls: 'bg-blue-500/15 text-blue-300 border-blue-700' },
  { value: 'manager',    label: 'Manager',    cls: 'bg-amber-500/15 text-amber-300 border-amber-700' },
  { value: 'engineer',   label: 'Engineer',   cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-700' },
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

function RoleBadge({ role }) {
  const r = ROLES.find(x => x.value === role) ?? ROLES[2]
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.cls}`}>
      {r.label}
    </span>
  )
}

const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
const selectCls = "w-full bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"

function UserForm({ user, engineers, onSubmit, onClose }) {
  const isEdit = !!user
  const [username, setUsername]   = useState(user?.username ?? '')
  const [password, setPassword]   = useState('')
  const [role, setRole]           = useState(user?.role ?? 'engineer')
  const [engineerIds, setEngineerIds] = useState(user?.engineer_ids ?? [])

  const toggleEngineer = (id) => {
    setEngineerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const body = { role, engineer_ids: engineerIds }
    if (!isEdit) { body.username = username; body.password = password }
    else if (password) body.password = password
    onSubmit(body)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-slate-800 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-base font-bold text-slate-100">{isEdit ? 'Edit User' : 'Add User'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-slate-700 mx-6" />

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Username *</label>
              <input required value={username} onChange={e => setUsername(e.target.value)} placeholder="username" className={inputCls} />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Password {isEdit ? '(leave blank to keep)' : '*'}
            </label>
            <input
              required={!isEdit}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isEdit ? 'New password (optional)' : 'Password'}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Role</label>
            <select className={selectCls} value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
              Linked Engineers <span className="normal-case font-normal text-slate-600">(optional)</span>
            </label>
            {engineers.length === 0 ? (
              <p className="text-xs text-slate-600 px-1">No engineers yet</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto rounded-xl border border-slate-600 bg-slate-700 p-2">
                {engineers.map(e => (
                  <label key={e.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={engineerIds.includes(e.id)}
                      onChange={() => toggleEngineer(e.id)}
                      className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                    />
                    {e.avatar_path
                      ? <img src={e.avatar_path} alt="" className="w-5 h-5 rounded-md object-cover shrink-0" />
                      : <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${getColor(e.name)} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{e.name[0].toUpperCase()}</span>
                    }
                    <span className="text-sm text-slate-200">{e.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-600 mt-1 px-1">Manager จะแก้ไข Task ได้เฉพาะ Engineer ที่เลือกไว้</p>
          </div>

          <div className="flex gap-2 pt-1 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-500 text-sm font-semibold text-slate-950 hover:bg-blue-400 transition-colors">
              {isEdit ? 'Save' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UserManagement({ engineers, onClose }) {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [formUser, setFormUser]   = useState(undefined) // undefined = closed, null = add, obj = edit

  useEffect(() => {
    getUsers().then(({ data }) => { setUsers(data); setLoading(false) })
  }, [])

  const handleSubmit = async (body) => {
    if (formUser) {
      const { data } = await updateUser(formUser.id, body)
      setUsers(prev => prev.map(u => u.id === formUser.id ? data : u))
    } else {
      const { data } = await createUser(body)
      setUsers(prev => [...prev, data])
    }
    setFormUser(undefined)
  }

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return
    await deleteUser(userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-slate-800 w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-100">User Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormUser(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-700 mx-6 shrink-0" />

        {/* User list */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-700/30 transition-colors group">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getColor(u.username)} flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0`}>
                    {u.engineer?.avatar_path
                      ? <img src={u.engineer.avatar_path} alt="" className="w-full h-full object-cover" />
                      : u.username[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-100">{u.username}</span>
                      <RoleBadge role={u.role} />
                    </div>
                    {u.engineers?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {u.engineers.map(e => (
                          <span key={e.id} className="text-[10px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded-md">
                            {e.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => setFormUser(u)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-slate-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-950/50 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-slate-600 text-center py-12">No users yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {formUser !== undefined && (
      <UserForm
        user={formUser}
        engineers={engineers}
        onSubmit={handleSubmit}
        onClose={() => setFormUser(undefined)}
      />
    )}
    </>
  )
}
