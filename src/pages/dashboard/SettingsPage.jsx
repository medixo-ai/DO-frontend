import React, { useState } from 'react'
import { Sun, Moon, Monitor, Globe, Shield, FileArchive, Users, Save, CheckCircle } from 'lucide-react'
import { PageHeader } from '../../components/shared/index.jsx'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    language: 'en',
    retention: '365',
    twoFactor: true,
    auditLog: true,
    notifications: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const toggle = key => setSettings(s => ({ ...s, [key]: !s[key] }))

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage system preferences and security." />

      {/* Theme */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map(({ value, icon: Icon, label }) => (
            <button key={value} onClick={() => setTheme(value === 'system' ? 'light' : value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === value || (value === 'system' && !['light','dark'].includes(theme)) ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <Icon className={`w-5 h-5 ${theme === value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${theme === value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Language & Region</h3>
        </div>
        <select value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))} className="input">
          <option value="en">English (US)</option>
          <option value="en-gb">English (UK)</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Security */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Security</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts' },
            { key: 'auditLog', label: 'Audit Logging', desc: 'Log all document access and user actions' },
            { key: 'notifications', label: 'Security Alerts', desc: 'Notify admins of suspicious activity' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button onClick={() => toggle(key)}
                className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${settings[key] ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                style={{ width: 40, height: 22 }}>
                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${settings[key] ? 'translate-x-4.5' : ''}`}
                  style={{ width: 18, height: 18, transform: settings[key] ? 'translateX(18px)' : 'translateX(0)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Settings */}
      {user?.role === 'admin' && (
        <>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileArchive className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Document Retention</h3>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Retain documents for</label>
              <select value={settings.retention} onChange={e => setSettings(s => ({ ...s, retention: e.target.value }))} className="input">
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
                <option value="730">2 years</option>
                <option value="0">Forever</option>
              </select>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Access Policies</h3>
            </div>
            <div className="space-y-3">
              {['Require manager approval for document uploads', 'Allow employees to share documents externally', 'Enable AI-generated document summaries'].map(policy => (
                <label key={policy} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={policy.includes('AI')} className="w-4 h-4 text-brand-600 rounded border-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{policy}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <button onClick={handleSave} className={`btn-primary px-6 py-2.5 ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
      </button>
    </div>
  )
}
