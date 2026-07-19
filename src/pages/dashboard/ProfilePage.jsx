import React, { useState } from 'react'
import { User, Mail, Building2, Shield, Camera, Save, CheckCircle, Bell, Key } from 'lucide-react'
import { PageHeader } from '../../components/shared/index.jsx'
import { useAuth } from '../../context/AuthContext'
import { getRoleColor } from '../../utils/helpers'

export default function ProfilePage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', department: user?.department || '' })
  const [notifs, setNotifs] = useState({ email: true, search: true, updates: false })

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const toggleNotif = key => setNotifs(n => ({ ...n, [key]: !n[key] }))

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader title="Profile" subtitle="Manage your account information and preferences." />

      {/* Avatar */}
      <div className="card p-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.avatar}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow">
              <Camera className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user?.email}</p>
            <span className={`badge capitalize ${getRoleColor(user?.role)}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input value={form.name} onChange={set('name')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={form.email} onChange={set('email')} className="input pl-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={form.department} onChange={set('department')} className="input pl-9">
                  {['HR', 'Finance', 'Legal', 'Operations', 'Sales', 'Engineering', 'General'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={user?.role} disabled className="input pl-9 opacity-60 cursor-not-allowed capitalize" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
        </div>
        <div className="space-y-3">
          <input type="password" placeholder="Current password" className="input" />
          <input type="password" placeholder="New password" className="input" />
          <input type="password" placeholder="Confirm new password" className="input" />
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
            { key: 'search', label: 'Search alerts', desc: 'Notify when saved searches have new results' },
            { key: 'updates', label: 'Product updates', desc: 'News about features and improvements' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button onClick={() => toggleNotif(key)}
                className={`relative rounded-full transition-colors flex-shrink-0 ${notifs[key] ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                style={{ width: 40, height: 22 }}>
                <span className="absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform"
                  style={{ width: 18, height: 18, transform: notifs[key] ? 'translateX(18px)' : 'translateX(0)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className={`btn-primary px-6 py-2.5 ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
      </button>
    </div>
  )
}
