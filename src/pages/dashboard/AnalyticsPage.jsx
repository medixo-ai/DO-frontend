import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Clock, CheckCircle, Search, Loader2 } from 'lucide-react'
import { PageHeader, StatCard } from '../../components/shared/index.jsx'
import { apiGetDashboardStats, apiGetSearchTrends, apiGetTopQueries } from '../../services/api'

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState([])
  const [topQueries, setTopQueries] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [statsData, trendsData, topData] = await Promise.all([
        apiGetDashboardStats().catch(() => null),
        apiGetSearchTrends().catch(() => ({ trends: [] })),
        apiGetTopQueries().catch(() => ({ top_queries: [] })),
      ])
      if (statsData) setStats(statsData)
      setTrends(trendsData.trends || [])
      setTopQueries(topData.top_queries || [])
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Analytics" subtitle="Insights into how your team uses the knowledge base." />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Documents" value={stats ? String(stats.total_documents) : '—'} icon={CheckCircle} color="green" loading={loading} />
        <StatCard title="Total Users" value={stats ? String(stats.total_users) : '—'} icon={TrendingUp} color="blue" loading={loading} />
        <StatCard title="Total Searches" value={stats ? String(stats.total_queries) : '—'} icon={Search} color="purple" loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">This Week's Daily Searches</h3>
          {loading ? (
            <div className="skeleton h-52 rounded-lg" />
          ) : trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="searches" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">
              No search data yet.
            </div>
          )}
        </div>

        {/* Search Trends Line Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Search Volume Trend</h3>
          {loading ? (
            <div className="skeleton h-52 rounded-lg" />
          ) : trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="searches" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} name="Searches" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">
              No search data yet.
            </div>
          )}
        </div>
      </div>

      {/* Top Queries */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Queries</h3>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-8 rounded" />)}
          </div>
        ) : topQueries.length > 0 ? (
          <div className="space-y-3">
            {topQueries.map(({ query, count }, i) => (
              <div key={query} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{query}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${(count / topQueries[0].count) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No queries yet. Ask questions in AI Search to see analytics here.
          </div>
        )}
      </div>
    </div>
  )
}
