import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bookmark, Clock, Filter, Zap, FileText, ChevronRight, Sparkles, AlertCircle, Building2, Hash, Eye, EyeOff, ExternalLink, X } from 'lucide-react'
import { apiQuery, apiGetDepartments, apiGetUploadedFiles } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const SUGGESTED_QUESTIONS = [
  'What are the key policies for employees?',
  'Explain the leave and absence policy',
  'What is the reimbursement process?',
  'Summarize document compliance requirements',
]

function formatAnswer(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n• /g, '<br/>• ')
    .replace(/\n- /g, '<br/>- ')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function AISearchPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [savedSearches, setSavedSearches] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState(null) // null = "All Departments"
  const bottomRef = useRef(null)
  const [expandedSources, setExpandedSources] = useState(new Set())
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [pdfViewer, setPdfViewer] = useState(null) // { url, name, page }

  const isAdmin = user?.role === 'admin'

  // Fetch departments from backend on mount
  useEffect(() => {
    apiGetDepartments()
      .then(data => {
        const depts = (data.departments || []).map(d => d.department).filter(Boolean)
        setDepartments(depts)

        // Non-admin users: default to their role as department
        if (!isAdmin && user?.role) {
          // Capitalize role name to match department naming (e.g. "manager" -> "Manager")
          const userDept = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
          if (depts.includes(userDept)) {
            setSelectedDept(userDept)
          } else if (depts.includes(user.role)) {
            setSelectedDept(user.role)
          }
        }
      })
      .catch(() => {
        // Fallback — use static list if API fails
        setDepartments(['HR', 'Finance', 'Legal', 'Engineering'])
      })
  }, [isAdmin, user?.role])

  // Fetch uploaded files so we can map document_id -> PDF filename
  useEffect(() => {
    apiGetUploadedFiles()
      .then(data => setUploadedFiles(data.files || []))
      .catch(() => {}) // non-critical
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const q = text || input
    if (!q.trim() || loading) return
    setInput('')
    setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, 8))

    const userMsg = { id: Date.now(), role: 'user', content: q, department: selectedDept }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const result = await apiQuery(q, selectedDept)

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: result.answer,
        sources: result.sources || [],
        documentsAccessed: result.documents_accessed || [],
        entitiesUsed: result.entities_used || [],
        relationshipCount: result.relationship_count || 0,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: err.message || 'Something went wrong. Please try again.',
        isError: true,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  // Open PDF in an in-page modal viewer
  const openSourcePdf = (src) => {
    if (!src.document_id) return
    const prefix = `${src.document_id}_`
    const match = uploadedFiles.find(f => f.filename.startsWith(prefix))
    if (match) {
      const page = src.page_numbers && src.page_numbers.length > 0 ? src.page_numbers[0] : 1
      setPdfViewer({
        url: `${match.url}#page=${page}`,
        name: src.document_name || match.filename,
        page,
      })
    }
  }

  const saveSearch = (query) => {
    setSavedSearches(prev => {
      if (prev.includes(query)) return prev
      return [query, ...prev].slice(0, 10)
    })
  }

  return (
    <>
    <div className="flex gap-6 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col card overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI Document Search</h2>
            <p className="text-xs text-gray-400">Knowledge graph powered · Real-time</p>
          </div>

          {/* Department badge in header */}
          <div className="ml-auto flex items-center gap-3">
            {selectedDept && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-medium">
                <Building2 className="w-3 h-3" />
                {selectedDept}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Ask anything about your documents</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">
                {selectedDept
                  ? `Searching within ${selectedDept} department documents`
                  : 'Get instant, cited answers from your knowledge graph. Powered by AI.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="flex items-center gap-2 text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all group text-sm text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-brand-300">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-400 flex-shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className={`w-7 h-7 ${msg.isError ? 'bg-red-500' : 'bg-brand-600'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {msg.isError ? <AlertCircle className="w-3.5 h-3.5 text-white" /> : <Zap className="w-3.5 h-3.5 text-white" />}
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5' : `${msg.isError ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800'} rounded-2xl rounded-tl-sm p-4`}`}>
                  {msg.role === 'user' ? (
                    <div>
                      <p className="text-sm">{msg.content}</p>
                      {msg.department && (
                        <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {msg.department}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm leading-relaxed ${msg.isError ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`}
                        dangerouslySetInnerHTML={{ __html: formatAnswer(msg.text) }} />

                      {/* Sources — eye toggle to show/hide */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedSources(prev => {
                              const next = new Set(prev)
                              if (next.has(msg.id)) next.delete(msg.id)
                              else next.add(msg.id)
                              return next
                            })}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          >
                            {expandedSources.has(msg.id)
                              ? <EyeOff className="w-3.5 h-3.5" />
                              : <Eye className="w-3.5 h-3.5" />}
                            {expandedSources.has(msg.id) ? 'Hide' : 'View'} Sources ({msg.sources.length})
                          </button>

                          <AnimatePresence>
                            {expandedSources.has(msg.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 space-y-2">
                                  {msg.sources.map((src, i) => (
                                    <div
                                      key={i}
                                      onClick={() => openSourcePdf(src)}
                                      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 ${src.document_id ? 'cursor-pointer hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-sm transition-all' : ''}`}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                          {src.document_name || 'Unknown document'}
                                        </span>
                                        {src.page_numbers && src.page_numbers.length > 0 && (
                                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                            <Hash className="w-3 h-3" />
                                            Page {src.page_numbers.join(', ')}
                                          </span>
                                        )}
                                        {src.document_id && (
                                          <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        )}
                                      </div>
                                      {src.entity_name && (
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                          <span className="text-[11px] text-gray-400">Entity:</span>
                                          <span className="text-[11px] text-gray-600 dark:text-gray-300">{src.entity_name}</span>
                                          {src.entity_type && (
                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                              {src.entity_type}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Entities & Relationships */}
                      {msg.entitiesUsed && msg.entitiesUsed.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="text-xs text-gray-400 mr-1">Entities:</span>
                          {msg.entitiesUsed.slice(0, 8).map((e, i) => (
                            <span key={i} className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                              {e}
                            </span>
                          ))}
                          {msg.entitiesUsed.length > 8 && (
                            <span className="text-xs text-gray-400">+{msg.entitiesUsed.length - 8} more</span>
                          )}
                        </div>
                      )}
                      {msg.relationshipCount > 0 && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          {msg.relationshipCount} relationship{msg.relationshipCount > 1 ? 's' : ''} traversed
                        </p>
                      )}

                      {/* Save button */}
                      {!msg.isError && (
                        <button onClick={() => {
                          const userMsg = messages.find(m => m.id === msg.id - 1)
                          if (userMsg) saveSearch(userMsg.content)
                        }}
                          className="mt-2 text-xs text-gray-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
                          <Bookmark className="w-3 h-3" /> Save this query
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
              <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    Searching {selectedDept ? `${selectedDept} ` : ''}knowledge graph...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={selectedDept
                  ? `Ask about ${selectedDept} documents...`
                  : 'Ask anything about company policies, contracts, HR guidelines...'}
                className="input pr-10 py-3"
              />
            </div>
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="btn-primary p-3 flex-shrink-0 disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">AI answers are generated from your ingested documents. Verify important information.</p>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:flex flex-col w-64 space-y-4">
        {/* Recent Searches */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Searches</h3>
          </div>
          {recentSearches.length === 0 ? (
            <p className="text-xs text-gray-400">No recent searches yet</p>
          ) : (
            <div className="space-y-1">
              {recentSearches.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors truncate">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Saved</h3>
            </div>
            <div className="space-y-1">
              {savedSearches.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors truncate">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Department Filter */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Department Filter</h3>
          </div>
          <div className="space-y-2">
            {/* "All Departments" option — admin always sees it, non-admin too for flexibility */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dept"
                checked={selectedDept === null}
                onChange={() => setSelectedDept(null)}
                className="w-3.5 h-3.5 text-brand-600"
              />
              <span className={`text-xs ${selectedDept === null ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                All Departments
              </span>
              {isAdmin && (
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">Admin</span>
              )}
            </label>

            {departments.map(dept => (
              <label key={dept} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dept"
                  checked={selectedDept === dept}
                  onChange={() => setSelectedDept(dept)}
                  className="w-3.5 h-3.5 text-brand-600"
                />
                <span className={`text-xs ${selectedDept === dept ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                  {dept}
                </span>
              </label>
            ))}

            {departments.length === 0 && (
              <p className="text-xs text-gray-400 italic">No departments found</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* PDF Viewer Modal */}
    <AnimatePresence>
      {pdfViewer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPdfViewer(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {pdfViewer.name}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
                  Page {pdfViewer.page}
                </span>
              </div>
              <button
                onClick={() => setPdfViewer(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PDF iframe */}
            <div className="flex-1">
              <iframe
                src={pdfViewer.url}
                title={pdfViewer.name}
                className="w-full h-full border-0"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </>
  )
}
