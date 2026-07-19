import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, RefreshCw, Search, FileText, ArrowRight,
  ChevronDown, ChevronUp, Shield, Zap, X, Info, Trash2
} from 'lucide-react'
import { apiGetContradictions, apiClearContradictions } from '../../services/api'

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

function getSeverity(score) {
  if (score >= 0.95) return { label: 'Critical', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400', dot: 'bg-red-500' }
  if (score >= 0.85) return { label: 'High', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' }
  if (score >= 0.75) return { label: 'Medium', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' }
  return { label: 'Low', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' }
}

function getTypeColor(type) {
  const map = {
    PERSON: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    ORGANIZATION: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    DATE: 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400',
    LOCATION: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    METRIC: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400',
    EVENT: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
  }
  return map[type?.toUpperCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
}

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

function DetailModal({ item, onClose }) {
  if (!item) return null
  const severity = getSeverity(item.similarity_score)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Contradiction Detail</h3>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${severity.color} mt-0.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
                {severity.label} — {(item.similarity_score * 100).toFixed(1)}% match
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Reason */}
          {item.reason && (
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">AI Explanation</p>
                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          )}

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entity A */}
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">A</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source Entity</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.new_name}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${getTypeColor(item.new_type)}`}>
                {item.new_type}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{item.new_description}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <FileText className="w-3 h-3" />
                <span className="truncate">{item.new_doc || item.new_doc_id}</span>
              </div>
            </div>

            {/* Entity B */}
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">B</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conflicting Entity</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.existing_name}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${getTypeColor(item.existing_type)}`}>
                {item.existing_type}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{item.existing_description}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <FileText className="w-3 h-3" />
                <span className="truncate">{item.existing_doc || item.existing_doc_id}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ContradictionsPage() {
  const [contradictions, setContradictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)
  const [clearing, setClearing] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGetContradictions()
      setContradictions(data.contradictions || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch contradictions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ---- Filters & sort ----
  const filtered = contradictions
    .filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !search ||
        c.new_name?.toLowerCase().includes(q) ||
        c.existing_name?.toLowerCase().includes(q) ||
        c.new_doc?.toLowerCase().includes(q) ||
        c.existing_doc?.toLowerCase().includes(q) ||
        c.reason?.toLowerCase().includes(q)

      if (severityFilter === 'all') return matchSearch
      const sev = getSeverity(c.similarity_score).label.toLowerCase()
      return matchSearch && sev === severityFilter
    })
    .sort((a, b) => sortAsc
      ? a.similarity_score - b.similarity_score
      : b.similarity_score - a.similarity_score
    )

  // ---- Stat counts ----
  const counts = {
    total: contradictions.length,
    critical: contradictions.filter(c => c.similarity_score >= 0.95).length,
    high: contradictions.filter(c => c.similarity_score >= 0.85 && c.similarity_score < 0.95).length,
    medium: contradictions.filter(c => c.similarity_score >= 0.75 && c.similarity_score < 0.85).length,
    low: contradictions.filter(c => c.similarity_score < 0.75).length,
  }

  const uniqueDocs = new Set(contradictions.flatMap(c => [c.new_doc, c.existing_doc].filter(Boolean)))

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Contradictions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            AI-detected conflicting claims across your documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!window.confirm('Delete all contradictions from Neo4j? This cannot be undone.')) return
              setClearing(true)
              try {
                await apiClearContradictions()
                await fetchData()
              } catch (err) {
                setError(err.message || 'Failed to clear contradictions')
              } finally {
                setClearing(false)
              }
            }}
            disabled={loading || clearing || contradictions.length === 0}
            className="btn-ghost flex items-center gap-2 text-sm text-red-500 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 className={`w-4 h-4 ${clearing ? 'animate-pulse' : ''}`} />
            Clear All
          </button>
          <button onClick={fetchData} disabled={loading}
            className="btn-ghost flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', value: counts.total, label: 'Total', icon: AlertTriangle, accent: 'brand', filterVal: 'all' },
          { key: 'critical', value: counts.critical, label: 'Critical', icon: Shield, accent: 'red', filterVal: 'critical' },
          { key: 'high', value: counts.high, label: 'High', icon: Zap, accent: 'orange', filterVal: 'high' },
          { key: 'medium', value: counts.medium, label: 'Medium', icon: AlertTriangle, accent: 'amber', filterVal: 'medium' },
          { key: 'low', value: counts.low, label: 'Low', icon: Info, accent: 'yellow', filterVal: 'low' },
          { key: 'docs', value: uniqueDocs.size, label: 'Documents', icon: FileText, accent: 'blue', filterVal: null },
        ].map(({ key, value, label, icon: Icon, accent, filterVal }) => (
          <button key={key}
            onClick={() => filterVal !== null && setSeverityFilter(filterVal)}
            disabled={filterVal === null}
            className={`card p-3 text-left transition-all ${filterVal !== null && severityFilter === filterVal ? `ring-2 ring-${accent}-500 dark:ring-${accent}-400` : 'hover:shadow-md'} ${filterVal === null ? 'cursor-default' : ''}`}>
            <div className="flex items-center justify-between mb-1.5">
              <Icon className={`w-4 h-4 text-${accent}-500`} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{value}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </button>
        ))}
      </div>

      {/* Search + Sort bar */}
      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by entity name, document, or reason..."
            className="input pl-9 py-2 text-sm w-full" />
        </div>
        <button onClick={() => setSortAsc(!sortAsc)}
          className="btn-ghost flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg whitespace-nowrap">
          Similarity
          {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            <button onClick={fetchData} className="text-xs text-red-600 hover:underline mt-1">Try again</button>
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
          <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {contradictions.length === 0 ? 'No contradictions detected' : 'No matching contradictions'}
          </h3>
          <p className="text-xs text-gray-400">
            {contradictions.length === 0
              ? 'All ingested documents are consistent — no conflicting claims found.'
              : 'Try adjusting your search or severity filter.'}
          </p>
        </div>
      )}

      {/* Contradictions Table */}
      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                {['Severity', 'Entity A', '', 'Entity B', 'Documents', 'Score', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence>
                {filtered.map((item, idx) => {
                  const severity = getSeverity(item.similarity_score)
                  const isExpanded = expandedRow === idx

                  return (
                    <React.Fragment key={idx}>
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : idx)}
                      >
                        {/* Severity */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${severity.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
                            {severity.label}
                          </span>
                        </td>

                        {/* Entity A */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{item.new_name}</p>
                          <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${getTypeColor(item.new_type)}`}>
                            {item.new_type}
                          </span>
                        </td>

                        {/* Arrow */}
                        <td className="px-1 py-3 text-center">
                          <ArrowRight className="w-4 h-4 text-red-400 mx-auto" />
                        </td>

                        {/* Entity B */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{item.existing_name}</p>
                          <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${getTypeColor(item.existing_type)}`}>
                            {item.existing_type}
                          </span>
                        </td>

                        {/* Documents */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="truncate max-w-[140px]">{item.new_doc || '—'}</span>
                            <span className="text-gray-300 dark:text-gray-600">vs</span>
                            <span className="truncate max-w-[140px]">{item.existing_doc || '—'}</span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${item.similarity_score >= 0.95 ? 'bg-red-500' : item.similarity_score >= 0.85 ? 'bg-orange-500' : item.similarity_score >= 0.75 ? 'bg-amber-500' : 'bg-yellow-500'}`}
                                style={{ width: `${item.similarity_score * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {(item.similarity_score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>

                        {/* Detail button */}
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedItem(item) }}
                            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                          >
                            Details
                          </button>
                        </td>
                      </motion.tr>

                      {/* Expanded inline row */}
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={7} className="px-4 py-4 bg-gray-50 dark:bg-gray-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entity A — Description</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.new_description || 'No description available'}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entity B — Description</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.existing_description || 'No description available'}</p>
                              </div>
                            </div>
                            {item.reason && (
                              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">AI Reason</p>
                                <p className="text-sm text-amber-900 dark:text-amber-200">{item.reason}</p>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
            Showing {filtered.length} of {contradictions.length} contradiction{contradictions.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>
    </div>
  )
}
