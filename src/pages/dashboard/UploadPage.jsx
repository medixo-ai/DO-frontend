import React, { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react'
import { PageHeader } from '../../components/shared/index.jsx'
import { apiUploadFile } from '../../services/api'

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [form, setForm] = useState({ name: '', department: 'HR', tags: '', access: 'All' })
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef()

  const ACCEPTED = ['.pdf', '.doc', '.docx', '.txt']

  const addFiles = (fileList) => {
    const valid = Array.from(fileList).filter(f =>
      ACCEPTED.some(ext => f.name.toLowerCase().endsWith(ext))
    )
    setFiles(prev => [...prev, ...valid.map(f => ({
      file: f,
      id: Math.random(),
      progress: 0,
      status: 'pending',   // pending | uploading | done | error
      error: null,
      result: null,
    }))])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const updateFile = (id, updates) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const uploadSingleFile = async (fileEntry) => {
    const docName = form.name || undefined

    updateFile(fileEntry.id, { status: 'uploading', progress: 0, error: null })

    try {
      const result = await apiUploadFile(fileEntry.file, {
        documentName: docName,
        department: form.department,
        accessLevel: form.access,
        tags: form.tags || undefined,
        onProgress: (percent) => {
          updateFile(fileEntry.id, { progress: percent })
        },
      })
      updateFile(fileEntry.id, { status: 'done', progress: 100, result })
      return true
    } catch (err) {
      updateFile(fileEntry.id, {
        status: 'error',
        error: err.message || 'Upload failed',
      })
      return false
    }
  }

  const handleSubmit = async () => {
    if (!files.length) return
    setUploading(true)

    const pendingFiles = files.filter(f => f.status !== 'done')
    for (const fileEntry of pendingFiles) {
      await uploadSingleFile(fileEntry)
    }

    setUploading(false)

    // Check if all files are done
    setFiles(prev => {
      const allDone = prev.every(f => f.status === 'done')
      if (allDone) setTimeout(() => setDone(true), 500)
      return prev
    })
  }

  const retryFile = async (id) => {
    const fileEntry = files.find(f => f.id === id)
    if (!fileEntry) return
    setUploading(true)
    await uploadSingleFile(fileEntry)
    setUploading(false)
  }

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id))
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const successCount = files.filter(f => f.status === 'done').length
  const errorCount = files.filter(f => f.status === 'error').length

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Complete!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {successCount} document{successCount > 1 ? 's' : ''} uploaded and ingested into the knowledge graph.
        </p>
        <div className="flex gap-3">
          <button onClick={() => { setFiles([]); setDone(false) }} className="btn-secondary">Upload More</button>
          <button onClick={() => window.history.back()} className="btn-primary">View Documents</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Upload Documents" subtitle="Add documents to your knowledge base for AI-powered search." />

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={e => addFiles(e.target.files)} />
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${dragging ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <Upload className={`w-7 h-7 ${dragging ? 'text-brand-600' : 'text-gray-400'}`} />
        </div>
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {dragging ? 'Drop files here' : 'Drag and drop files here'}
        </h3>
        <p className="text-sm text-gray-400 mb-2">or click to browse</p>
        <p className="text-xs text-gray-400">Supported: PDF, DOC, DOCX, TXT · Max 50MB per file</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Files to upload ({files.length})
            {successCount > 0 && <span className="text-green-500 ml-2">· {successCount} done</span>}
            {errorCount > 0 && <span className="text-red-500 ml-2">· {errorCount} failed</span>}
          </h3>
          {files.map(({ file, id, progress, status, error }) => (
            <div key={id} className={`flex items-center gap-3 p-3 rounded-lg ${status === 'error' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <FileText className={`w-5 h-5 flex-shrink-0 ${status === 'error' ? 'text-red-500' : 'text-brand-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {status === 'uploading' && (
                  <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {status === 'uploading' && (
                  <p className="text-xs text-brand-500 mt-1">
                    {progress < 100 ? `Uploading... ${progress}%` : 'Processing & ingesting...'}
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </div>
              {status === 'done' ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : status === 'error' ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => retryFile(id)} disabled={uploading}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-400 hover:text-red-600" title="Retry">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeFile(id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : status === 'uploading' ? (
                <span className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin flex-shrink-0" />
              ) : (
                <button onClick={() => removeFile(id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Document Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Document Name (optional)</label>
          <input value={form.name} onChange={set('name')} className="input" placeholder="Auto-detected from file name" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
            <select value={form.department} onChange={set('department')} className="input">
              {['HR', 'Finance', 'Legal', 'Operations', 'Sales', 'Engineering'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Access Level</label>
            <select value={form.access} onChange={set('access')} className="input">
              <option value="All">All Employees</option>
              <option value="Manager">Manager+</option>
              <option value="Admin">Admin Only</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
          <input value={form.tags} onChange={set('tags')} className="input" placeholder="policy, hr, onboarding" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => window.history.back()} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={!files.length || uploading || files.every(f => f.status === 'done')}
          className="btn-primary flex-1 justify-center"
        >
          {uploading ? (
            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</span>
          ) : errorCount > 0 ? (
            `Retry ${errorCount} failed file${errorCount > 1 ? 's' : ''}`
          ) : (
            `Upload ${files.length ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Documents'}`
          )}
        </button>
      </div>
    </div>
  )
}

