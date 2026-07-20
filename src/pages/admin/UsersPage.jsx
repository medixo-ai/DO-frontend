import React, { useState, useEffect } from 'react'
import { Search, UserPlus, Edit, Trash2, Shield, RotateCcw, Loader2, AlertCircle } from 'lucide-react'
import { PageHeader, Modal } from '../../components/shared/index.jsx'
import { apiGetUsers, apiCreateUser, apiDeleteUser, apiUpdateUser } from '../../services/api'
import { getRoleColor, getStatusColor } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'hr' })

  // Fetch users from API on mount
  useEffect(() => {
    if (user?.role !== 'admin') return
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGetUsers()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Access Restricted</h3>
        <p className="text-sm text-gray-400 mt-1">This page is only accessible to administrators.</p>
      </div>
    )
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  )

  const deleteUser = async (id) => {
    if (!window.confirm('Remove this user?')) return
    try {
      await apiDeleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete user')
    }
  }

  const addUser = async () => {
    if (!form.name || !form.email || !form.password) return
    setSubmitting(true)
    try {
      const data = await apiCreateUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      setUsers(prev => [data.user, ...prev])
      setAddOpen(false)
      setForm({ name: '', email: '', password: '', role: 'hr' })
    } catch (err) {
      alert(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const getAvatar = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} user${users.length !== 1 ? 's' : ''} registered`}
        action={
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        }
      />

      {/* Search & filter */}
      <div className="card p-3 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input pl-9 py-2 text-sm" />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
          <p className="text-sm text-gray-400">Loading users...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="card p-8 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchUsers} className="btn-primary text-sm">Retry</button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {['User', 'Role', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                      {search ? 'No users match your search.' : 'No users found. Add one above.'}
                    </td>
                  </tr>
                )}
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getAvatar(u.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${getRoleColor(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title="Delete" onClick={() => deleteUser(u.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input value={form.name} onChange={set('name')} className="input" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="jane@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={set('password')} className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
            <select value={form.role} onChange={set('role')} className="input">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAddOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={addUser} disabled={!form.name || !form.email || !form.password || submitting}
              className="btn-primary flex-1 justify-center">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Add User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
