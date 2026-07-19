import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Users, Search, TrendingUp, AlertCircle, Building2 } from 'lucide-react'
import { PageHeader } from '../../components/shared/index.jsx'
import { apiGetDepartments } from '../../services/api'

// Stable color/icon mapping so each department always looks the same
const DEPT_STYLES = {
  HR:          { color: 'bg-purple-500', icon: '👥' },
  Finance:     { color: 'bg-green-500',  icon: '💰' },
  Legal:       { color: 'bg-red-500',    icon: '⚖️' },
  Operations:  { color: 'bg-orange-500', icon: '⚙️' },
  Sales:       { color: 'bg-blue-500',   icon: '📈' },
  Engineering: { color: 'bg-cyan-500',   icon: '🛠️' },
}

const FALLBACK_COLORS = [
  'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
  'bg-amber-500', 'bg-rose-500', 'bg-emerald-500',
]

function getDeptStyle(name, index) {
  if (DEPT_STYLES[name]) return DEPT_STYLES[name]
  return {
    color: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    icon: '🏢',
  }
}

export default function DepartmentsPage() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGetDepartments()
        if (!cancelled) setDepartments(data?.departments || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load departments')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Departments" subtitle="Manage document access and usage by department." />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-24" />
                  <div className="h-3 bg-gray-800 rounded w-16" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="bg-gray-800 rounded-lg p-2.5 h-16" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && departments.length === 0 && (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-300 mb-1">No departments yet</h3>
          <p className="text-sm text-gray-500">Upload documents with a department tag to see them here.</p>
        </div>
      )}

      {/* Department cards */}
      {!loading && departments.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, idx) => {
            const style = getDeptStyle(dept.department, idx)
            return (
              <div
                key={dept.department}
                className="card p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate('/documents')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${style.color} rounded-xl flex items-center justify-center text-xl`}>
                    {style.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{dept.department}</h3>
                    <p className="text-xs text-gray-400">Department</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: FileText, label: 'Documents', value: dept.document_count, color: 'text-blue-500' },
                    { icon: Users, label: 'Members', value: dept.member_count, color: 'text-green-500' },
                    { icon: Search, label: 'Searches', value: dept.search_count || 0, color: 'text-purple-500' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Documents in department</span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <FileText className="w-3 h-3" /> {dept.document_count} docs
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
