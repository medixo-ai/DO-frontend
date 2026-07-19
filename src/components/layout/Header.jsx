import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/search': 'AI Search',
  '/documents': 'Documents',
  '/upload': 'Upload Documents',
  '/departments': 'Departments',
  '/analytics': 'Analytics',
  '/users': 'User Management',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)

  const title = breadcrumbMap[location.pathname] || 'IntelliDocs'

  const notifications = [
    { id: 1, text: 'New document uploaded in HR', time: '5m ago', unread: true },
    { id: 2, text: 'Your search report is ready', time: '1h ago', unread: true },
    { id: 3, text: 'System maintenance tonight', time: '3h ago', unread: false },
  ]
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            {user?.department} · {user?.role}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Search */}
        <button
          onClick={() => navigate('/search')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 card shadow-lg z-50">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 flex items-start gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${n.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    {n.unread && <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />}
                    <div className={n.unread ? '' : 'pl-3.5'}>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer" onClick={() => navigate('/profile')}>
          {user?.avatar}
        </div>
      </div>
    </header>
  )
}
