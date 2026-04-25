import { useState, useEffect, useRef, useCallback } from 'react'
import Header from './components/Header'
import Section from './components/Section'
import CategorySummaryCard from './components/CategorySummaryCard'
import ItemDetailModal from './components/ItemDetailModal'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8788').replace(/\/$/, '')

function App() {
  const [data, setData] = useState({
    config: { categories: [], subjects: [], semester: null },
    data: {},
    history: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const hasInitialized = useRef(false)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    if (silent) setIsSyncing(true)
    try {
      const res = await fetch(`${API_URL}/api/data`)
      const contentType = res.headers.get('content-type') || ''
      if (!res.ok || !contentType.includes('application/json')) {
        const text = await res.text()
        const preview = text.replace(/<[^>]*>/g, '').slice(0, 120)
        throw new Error(`Server returned HTTP ${res.status} (expected JSON). Response preview: ${preview}`)
      }
      const payload = await res.json()
      setData(payload)
      setLastUpdated(new Date())
      setError(null)

      if (!hasInitialized.current && payload.config?.categories?.length > 0) {
        hasInitialized.current = true
        if (window.innerWidth >= 768) {
          setExpandedCategories({ [payload.config.categories[0].id]: true })
        }
      }
    } catch (err) {
      if (!silent) setError(err.message)
    } finally {
      if (!silent) setLoading(false)
      if (silent) setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchData(true)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchData])

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  const getSubject = (subjectId) => {
    return data.config?.subjects?.find(s => s.id === subjectId)
  }

  const handleItemClick = (item, categoryId) => {
    setSelectedItem(item)
    setSelectedCategoryId(categoryId)
  }

  const handleDeleteItem = useCallback(async (itemId, categoryId) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      const res = await fetch(`${API_URL}/api/${categoryId}?id=${itemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      fetchData(true)
      setSelectedItem(null)
    } catch (err) {
      alert('Error deleting: ' + err.message)
    }
  }, [fetchData])

  const categories = data.config?.categories || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 animate-pulse">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white/90 mb-2">Connection Error</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => fetchData(false)}
            className="inline-flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
          <p className="text-xs text-slate-500 mt-4">Make sure the server is running at {API_URL}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <Header config={data.config} lastUpdated={lastUpdated} isSyncing={isSyncing} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white/90 mb-2">No Categories Yet</h2>
            <p className="text-sm text-slate-400">Visit the dashboard to add categories and items.</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* Summary Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {categories.map(cat => (
                <CategorySummaryCard
                  key={cat.id}
                  category={cat}
                  count={(data.data[cat.id] || []).length}
                  isExpanded={!!expandedCategories[cat.id]}
                  onToggle={() => toggleCategory(cat.id)}
                />
              ))}
              {data.history?.assignments?.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border bg-gradient-to-br from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-300 backdrop-blur-md transition-all duration-300 active:scale-95 min-h-[110px] min-w-[100px] flex-1 ${
                    showHistory ? 'ring-2 ring-white/20 shadow-lg' : 'hover:shadow-md'
                  }`}
                >
                  <svg className="w-6 h-6 mb-2 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Archive</span>
                  <span className="text-2xl font-bold mt-1">{data.history.assignments.length}</span>
                  <span className="text-[10px] opacity-60 mt-0.5">archived</span>
                </button>
              )}
            </div>

            {/* History Section */}
            {showHistory && data.history?.assignments?.length > 0 && (
              <Section
                category={{ id: 'history', label: 'Archived Assignments', icon: 'archive', color: 'slate' }}
                items={data.history.assignments}
                subjects={data.config.subjects || []}
                isExpanded={true}
                onToggle={() => setShowHistory(false)}
                onItemClick={(item) => handleItemClick(item, 'assignments')}
                onItemDelete={(itemId) => handleDeleteItem(itemId, 'assignments')}
              />
            )}

            {/* Category Sections */}
            {categories.map((category, index) => (
              <Section
                key={category.id}
                category={category}
                items={data.data[category.id] || []}
                subjects={data.config.subjects || []}
                isExpanded={!!expandedCategories[category.id]}
                onToggle={() => toggleCategory(category.id)}
                onItemClick={(item) => handleItemClick(item, category.id)}
                onItemDelete={(itemId) => handleDeleteItem(itemId, category.id)}
                delay={index * 100}
              />
            ))}
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          subject={getSubject(selectedItem.subjectId)}
          categoryId={selectedCategoryId}
          onClose={() => setSelectedItem(null)}
          onDelete={(itemId, catId) => handleDeleteItem(itemId, catId)}
        />
      )}

      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-1">
          <p className="text-xs text-slate-500">My Cust V2 — Auto-synced from Server</p>
          {lastUpdated && (
            <p className="text-[10px] text-slate-600">
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App

