import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Trash2, FileText, Calendar, User, Shield, Activity, Eye, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { apiGetAllDocuments, apiGetUploadedFiles, findUploadedFile } from '../../services/api'
import { formatDate, getFileIcon, getAccessColor } from '../../utils/helpers'
import { PageHeader } from '../../components/shared/index.jsx'

function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const TABS = ['Overview', 'Content Preview', 'Permissions', 'Activity Logs']

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)       // { filename, url, size }
  const [textContent, setTextContent] = useState(null)  // For text file preview
  const [textLoading, setTextLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        // Fetch document metadata and uploaded file list in parallel
        const [docData, filesData] = await Promise.all([
          apiGetAllDocuments(),
          apiGetUploadedFiles(),
        ])
        const docs = docData?.documents || []
        const found = docs.find(d => String(d.document_id) === String(id))
        if (!cancelled) {
          setDoc(found || null)
          if (!found) {
            setError('Document not found')
          } else {
            // Find the matching uploaded file
            const files = filesData?.files || []
            const match = findUploadedFile(files, found.document_id)
            setFileInfo(match)
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load document')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // Fetch text content when switching to Content Preview for text files
  useEffect(() => {
    if (activeTab !== 'Content Preview' || !fileInfo || !doc) return
    const fileType = (doc.file_type || 'txt').toLowerCase()
    if (fileType === 'pdf') return // PDF uses iframe, no fetch needed

    let cancelled = false
    async function fetchText() {
      setTextLoading(true)
      try {
        const res = await fetch(fileInfo.url)
        if (res.ok) {
          const text = await res.text()
          if (!cancelled) setTextContent(text)
        }
      } catch {
        // Silently fail — will show fallback
      } finally {
        if (!cancelled) setTextLoading(false)
      }
    }
    fetchText()
    return () => { cancelled = true }
  }, [activeTab, fileInfo, doc])

  const handleDownload = () => {
    if (!fileInfo) return
    const a = document.createElement('a')
    a.href = fileInfo.url
    a.download = fileInfo.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleViewNewTab = () => {
    if (!fileInfo) return
    window.open(fileInfo.url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        <span className="ml-2 text-gray-400">Loading document…</span>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/documents')} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <PageHeader title="Document Not Found" subtitle="The requested document could not be loaded." />
        </div>
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || 'Document not found'}</span>
        </div>
      </div>
    )
  }

  const fileType = (doc.file_type || 'txt').toLowerCase()
  const isPDF = fileType === 'pdf'
  const isText = ['txt', 'text', 'md', 'csv', 'json', 'xml', 'html'].includes(fileType)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/documents')} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <PageHeader title={doc.document_name} subtitle={`${doc.department} · Uploaded ${formatDate(doc.created_at)}`} />
        </div>
        <div className="flex gap-2">
          {fileInfo && (
            <>
              <button onClick={handleViewNewTab} className="btn-secondary"><ExternalLink className="w-4 h-4" /> Open</button>
              <button onClick={handleDownload} className="btn-secondary"><Download className="w-4 h-4" /> Download</button>
            </>
          )}
          <button className="btn-secondary"><Share2 className="w-4 h-4" /> Share</button>
          <button className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Document Info</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {doc.document_name} — uploaded by {doc.uploaded_by || 'Unknown'} on {formatDate(doc.created_at)}.
                Status: <span className="font-medium">{doc.status}</span>.
              </p>
            </div>
            {(doc.tags || []).length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map(tag => (
                    <span key={tag} className="badge bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"># {tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Metadata</h3>
              <div className="space-y-3">
                {[
                  { icon: FileText, label: 'Type', value: (doc.file_type || 'txt').toUpperCase() },
                  { icon: Calendar, label: 'Uploaded', value: formatDate(doc.created_at) },
                  { icon: User, label: 'Uploaded by', value: doc.uploaded_by || '—' },
                  { icon: Activity, label: 'Size', value: formatFileSize(doc.file_size_bytes) },
                  { icon: Shield, label: 'Access', value: doc.access_level || 'All' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick View Button */}
            {fileInfo && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab('Content Preview')}
                    className="btn-primary w-full justify-center">
                    <Eye className="w-4 h-4" /> View Document
                  </button>
                  <button onClick={handleDownload}
                    className="btn-secondary w-full justify-center">
                    <Download className="w-4 h-4" /> Download File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Content Preview' && (
        <div className="card p-5">
          {!fileInfo ? (
            /* No file found on server */
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 min-h-64 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">{getFileIcon(doc.file_type || 'txt')}</div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{doc.document_name}</h3>
              <p className="text-sm text-gray-400 mb-2">{formatFileSize(doc.file_size_bytes)}</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Original file not found on server. It may have been removed.</span>
              </div>
            </div>
          ) : isPDF ? (
            /* PDF Viewer — inline iframe */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">PDF Preview</h3>
                <div className="flex gap-2">
                  <button onClick={handleViewNewTab} className="btn-ghost text-xs px-3 py-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
                  </button>
                  <button onClick={handleDownload} className="btn-ghost text-xs px-3 py-1.5">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: '75vh' }}>
                <iframe
                  src={fileInfo.url}
                  title={doc.document_name}
                  className="w-full h-full"
                  style={{ border: 'none', background: '#525659' }}
                />
              </div>
            </div>
          ) : isText ? (
            /* Text File Viewer */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {fileType.toUpperCase()} Content
                </h3>
                <button onClick={handleDownload} className="btn-ghost text-xs px-3 py-1.5">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
              {textLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                  <span className="ml-2 text-sm text-gray-400">Loading content…</span>
                </div>
              ) : textContent ? (
                <div className="bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto" style={{ maxHeight: '75vh' }}>
                  <pre className="p-5 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {textContent}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-400 mb-3">Unable to load text content inline.</p>
                  <button onClick={handleDownload} className="btn-primary">
                    <Download className="w-4 h-4" /> Download to view
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Other file types — download only */
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 min-h-64 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">{getFileIcon(doc.file_type || 'txt')}</div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{doc.document_name}</h3>
              <p className="text-sm text-gray-400 mb-4">{formatFileSize(doc.file_size_bytes)} · {fileType.toUpperCase()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Preview not available for this file type.
              </p>
              <div className="flex gap-2">
                <button onClick={handleViewNewTab} className="btn-secondary">
                  <ExternalLink className="w-4 h-4" /> Open in browser
                </button>
                <button onClick={handleDownload} className="btn-primary">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Permissions' && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Access Control</h3>
          <div className="space-y-3">
            {[
              { role: 'Admin', access: 'Full access (view, edit, delete, share)', granted: true },
              { role: 'Manager', access: 'View, download, share', granted: (doc.access_level || 'All') !== 'Admin' },
              { role: 'Employee', access: 'View only', granted: (doc.access_level || 'All') === 'All' },
            ].map(({ role, access, granted }) => (
              <div key={role} className={`flex items-center gap-3 p-3 rounded-lg border ${granted ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'}`}>
                <div className={`w-2 h-2 rounded-full ${granted ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{access}</p>
                </div>
                <span className={`ml-auto badge ${granted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                  {granted ? 'Granted' : 'Restricted'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Activity Logs' && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Activity History</h3>
          <div className="space-y-3">
            {[
              { action: 'Document uploaded', user: doc.uploaded_by || 'System', time: formatDate(doc.created_at), type: 'upload' },
              ...(doc.reviewed_by ? [{ action: `Document ${doc.status}`, user: doc.reviewed_by, time: doc.reviewed_at ? formatDate(doc.reviewed_at) : '—', type: 'review' }] : []),
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{log.action}</p>
                  <p className="text-xs text-gray-400">by {log.user}</p>
                </div>
                <span className="text-xs text-gray-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

