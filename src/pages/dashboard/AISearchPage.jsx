import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bookmark, Clock, Filter, Zap, FileText, ChevronRight, Sparkles, AlertCircle } from 'lucide-react'
import { apiQuery } from '../../services/api'

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
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [savedSearches, setSavedSearches] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const q = text || input
    if (!q.trim() || loading) return
    setInput('')
    setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, 8))

    const userMsg = { id: Date.now(), role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const result = await apiQuery(q)

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: result.answer,
        sources: (result.documents_accessed || []).map(docName => ({
          name: docName,
        })),
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

  const saveSearch = (query) => {
    setSavedSearches(prev => {
      if (prev.includes(query)) return prev
      return [query, ...prev].slice(0, 10)
    })
  }

  return (
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
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Online</span>
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
              <p className="text-sm text-gray-400 mb-6 max-w-sm">Get instant, cited answers from your knowledge graph. Powered by AI.</p>
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
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <>
                      <p className={`text-sm leading-relaxed ${msg.isError ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`}
                        dangerouslySetInnerHTML={{ __html: formatAnswer(msg.text) }} />

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Sources ({msg.sources.length} document{msg.sources.length > 1 ? 's' : ''})
                          </p>
                          {msg.sources.map((src, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5">
                              <div className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{src.name}</span>
                              </div>
                            </div>
                          ))}
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
                  <span className="text-xs text-gray-400 ml-1">Searching knowledge graph...</span>
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
                placeholder="Ask anything about company policies, contracts, HR guidelines..."
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

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Search Filters</h3>
          </div>
          <div className="space-y-2">
            {['All Departments', 'HR', 'Finance', 'Legal', 'Engineering'].map(dept => (
              <label key={dept} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="dept" defaultChecked={dept === 'All Departments'}
                  className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{dept}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
