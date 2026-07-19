import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, Users, Search, Building2, Upload, MessageSquare, UserPlus, TrendingUp, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { StatCard, PageHeader } from '../../components/shared/index.jsx'
import { apiGetDashboardStats, apiGetRecentActivity, apiGetSearchTrends } from '../../services/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState({ recent_queries: [], recent_documents: [] })
  const [trends, setTrends] = useState([])

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const [statsData, activityData, trendsData] = await Promise.all([
        apiGetDashboardStats().catch(() => null),
        apiGetRecentActivity().catch(() => ({ recent_queries: [], recent_documents: [] })),
        apiGetSearchTrends().catch(() => ({ trends: [] })),
      ])
      if (statsData) setStats(statsData)
      setActivity(activityData)
      setTrends(trendsData.trends || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Documents', value: stats ? String(stats.total_documents) : '—', icon: FileText, color: 'blue' },
    { title: 'Active Users', value: stats ? String(stats.total_users) : '—', icon: Users, color: 'green' },
    { title: 'Questions Asked', value: stats ? String(stats.total_queries) : '—', icon: Search, color: 'purple' },
  ]

  const quickActions = [
    { label: 'Upload Document', icon: Upload, to: '/upload', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { label: 'Ask AI', icon: MessageSquare, to: '/search', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
    { label: 'Manage Users', icon: UserPlus, to: '/users', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', adminOnly: true },
    { label: 'View Analytics', icon: TrendingUp, to: '/analytics', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
  ]

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Good morning, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening with your knowledge base today."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(s => <StatCard key={s.title} {...s} loading={loading} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Search Trends */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Search Trends (This Week)</h3>
          {loading ? (
            <div className="skeleton h-48 w-full rounded-lg" />
          ) : trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="searches" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No search data yet. Ask a question in AI Search to get started.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            {quickActions
              .filter(a => !a.adminOnly || user?.role === 'admin')
              .map(({ label, icon: Icon, to, color }) => (
                <button key={label} onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-left">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity (queries) */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent Questions</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : activity.recent_queries.length > 0 ? (
            <div className="space-y-3">
              {activity.recent_queries.map(q => (
                <div key={q.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                    <Search className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-medium">{q.user_name}</span>{' '}
                      <span className="text-gray-500 dark:text-gray-400">asked</span>{' '}
                      <span className="font-medium text-brand-600 dark:text-brand-400 truncate">{q.question}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(q.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No questions asked yet.
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Documents</h3>
            <button onClick={() => navigate('/documents')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded" />)}
            </div>
          ) : activity.recent_documents.length > 0 ? (
            <div className="space-y-2">
              {activity.recent_documents.map(doc => (
                <button key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-left transition-colors">
                  <span className="text-lg flex-shrink-0">📄</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.department} · {formatTimeAgo(doc.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No documents uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
