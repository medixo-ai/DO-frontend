import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Grid, List, Filter, Download, Share2, Trash2, Eye, Upload, AlertCircle, FileText } from 'lucide-react'
import { PageHeader, Badge, EmptyState } from '../../components/shared/index.jsx'
import { apiGetAllDocuments } from '../../services/api'
import { formatDate, getFileIcon, getAccessColor } from '../../utils/helpers'

function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [accessFilter, setAccessFilter] = useState('All')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGetAllDocuments()
        if (!cancelled) setDocuments(data?.documents || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load documents')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const departments = ['All', ...new Set(documents.map(d => d.department).filter(Boolean))]
  const accessLevels = ['All', 'Manager', 'Admin']

  const filtered = documents.filter(doc => {
    const name = (doc.document_name || '').toLowerCase()
    const dept = (doc.department || '').toLowerCase()
    const tags = doc.tags || []
    const q = search.toLowerCase()
    const matchSearch = !q || name.includes(q) || dept.includes(q) || tags.some(t => t.toLowerCase().includes(q))
    const matchDept = deptFilter === 'All' || doc.department === deptFilter
    const matchAccess = accessFilter === 'All' || doc.access_level === accessFilter
    return matchSearch && matchDept && matchAccess
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Document Library"
        subtitle={`${documents.length} documents across all departments`}
        action={
          <button onClick={() => navigate('/upload')} className="btn-primary">
            <Upload className="w-4 h-4" /> Upload
          </button>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..." className="input pl-9 py-2 text-sm" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="input py-2 text-sm w-auto min-w-32">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={accessFilter} onChange={e => setAccessFilter(e.target.value)}
          className="input py-2 text-sm w-auto min-w-32">
          {accessLevels.map(a => <option key={a}>{a}</option>)}
        </select>
        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
          <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-700 rounded" />
                <div className="w-12 h-5 bg-gray-700 rounded-full" />
              </div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/2 mb-1" />
              <div className="h-3 bg-gray-800 rounded w-2/3 mb-3" />
              <div className="flex gap-1">
                <div className="h-5 w-14 bg-gray-800 rounded-full" />
                <div className="h-5 w-14 bg-gray-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <EmptyState icon={Filter} title="No documents found" description={documents.length === 0 ? "Upload your first document to get started." : "Try adjusting your search or filter criteria."} />
          ) : view === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(doc => (
                <div key={doc.document_id} className="card p-4 hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate(`/documents/${doc.document_id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{getFileIcon(doc.file_type || 'txt')}</div>
                    <span className={`badge text-xs ${getAccessColor(doc.access_level || 'All')}`}>{doc.access_level || 'All'}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{doc.document_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{doc.department}</p>
                  <p className="text-xs text-gray-400 mb-3">{formatDate(doc.created_at)} · {formatFileSize(doc.file_size_bytes)}</p>
                  <div className="flex gap-1 flex-wrap">
                    {(doc.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">{tag}</span>
                    ))}
                    {doc.status && doc.status !== 'approved' && (
                      <span className={`badge text-xs ${doc.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {doc.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button className="btn-ghost p-1.5 text-gray-400 hover:text-brand-600" title="View"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="btn-ghost p-1.5 text-gray-400 hover:text-green-600" title="Download"><Download className="w-3.5 h-3.5" /></button>
                    <button className="btn-ghost p-1.5 text-gray-400 hover:text-blue-600" title="Share"><Share2 className="w-3.5 h-3.5" /></button>
                    <button className="btn-ghost p-1.5 text-gray-400 hover:text-red-500 ml-auto" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    {['Name', 'Department', 'Access', 'Status', 'Size', 'Uploaded', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(doc => (
                    <tr key={doc.document_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => navigate(`/documents/${doc.document_id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{getFileIcon(doc.file_type || 'txt')}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{doc.document_name}</p>
                            <div className="flex gap-1 mt-0.5">
                              {(doc.tags || []).slice(0, 1).map(t => <span key={t} className="text-xs text-gray-400">#{t}</span>)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{doc.department}</td>
                      <td className="px-4 py-3"><span className={`badge ${getAccessColor(doc.access_level || 'All')}`}>{doc.access_level || 'All'}</span></td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${doc.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : doc.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatFileSize(doc.file_size_bytes)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(doc.created_at)}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-brand-600"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-green-600"><Download className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
