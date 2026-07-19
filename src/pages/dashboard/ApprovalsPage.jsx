import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, FileText, AlertCircle, RefreshCw, Filter, Search } from 'lucide-react'
import { apiGetAllDocuments, apiApproveDocument, apiRejectDocument } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    icon: XCircle,
  },
}

export default function ApprovalsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGetAllDocuments()
      setDocuments(data.documents || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleApprove = async (docId) => {
    setActionLoading(docId)
    try {
      await apiApproveDocument(docId, user?.name || 'admin')
      setDocuments(prev =>
        prev.map(d => d.document_id === docId
          ? { ...d, status: 'approved', reviewed_by: user?.name || 'admin', reviewed_at: new Date().toISOString() }
          : d
        )
      )
    } catch (err) {
      alert(`Failed to approve: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (docId) => {
    setActionLoading(docId)
    try {
      await apiRejectDocument(docId, user?.name || 'admin')
      setDocuments(prev =>
        prev.map(d => d.document_id === docId
          ? { ...d, status: 'rejected', reviewed_by: user?.name || 'admin', reviewed_at: new Date().toISOString() }
          : d
        )
      )
    } catch (err) {
      alert(`Failed to reject: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = documents.filter(doc => {
    const matchStatus = statusFilter === 'all' || doc.status === statusFilter
    const matchSearch = !search ||
      doc.document_name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.uploaded_by?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    all: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch { return dateStr }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Document Approvals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review and approve uploaded documents for search access
          </p>
        </div>
        <button onClick={fetchDocuments} disabled={loading}
          className="btn-ghost flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'Total', icon: FileText, accent: 'brand' },
          { key: 'pending', label: 'Pending', icon: Clock, accent: 'amber' },
          { key: 'approved', label: 'Approved', icon: CheckCircle, accent: 'green' },
          { key: 'rejected', label: 'Rejected', icon: XCircle, accent: 'red' },
        ].map(({ key, label, icon: Icon, accent }) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`card p-3 text-left transition-all ${statusFilter === key ? `ring-2 ring-${accent}-500 dark:ring-${accent}-400` : 'hover:shadow-md'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <Icon className={`w-4 h-4 text-${accent}-500`} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{counts[key]}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by document name or uploader..."
            className="input pl-9 py-2 text-sm w-full" />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            <button onClick={fetchDocuments} className="text-xs text-red-600 hover:underline mt-1">Try again</button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {documents.length === 0 ? 'No documents yet' : 'No matching documents'}
          </h3>
          <p className="text-xs text-gray-400">
            {documents.length === 0
              ? 'Upload a document first, then come here to approve it.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      )}

      {/* Documents Table */}
      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                {['ID', 'Document', 'Uploaded By', 'Status', 'Reviewed By', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence>
                {filtered.map(doc => {
                  const statusConf = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending
                  const StatusIcon = statusConf.icon
                  const isActioning = actionLoading === doc.document_id

                  return (
                    <motion.tr
                      key={doc.document_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{doc.document_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {doc.document_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{doc.uploaded_by || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{doc.reviewed_by || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(doc.created_at)}</td>
                      <td className="px-4 py-3">
                        {doc.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(doc.document_id)}
                              disabled={isActioning}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isActioning ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(doc.document_id)}
                              disabled={isActioning}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            {doc.status === 'approved' ? 'Approved' : 'Rejected'}
                            {doc.reviewed_at ? ` on ${formatDate(doc.reviewed_at)}` : ''}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
