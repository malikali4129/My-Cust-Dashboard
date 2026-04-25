import { useState, useEffect, useMemo } from 'react'
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
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/data`)
      .then(async r => {
        const contentType = r.headers.get('content-type') || ''
        if (!r.ok || !contentType.includes('application/json')) {
          const text = await r.text()
          const preview = text.replace(/<[^>]*>/g, '').slice(0, 120)
          throw new Error(`Server returned HTTP ${r.status} (expected JSON). Response preview: ${preview}`)
        }
        return r.json()
      })
      .then(payload => {
        setData(payload)
        // Expand first category by default on desktop
        const firstCat = payload.config?.categories?.[0]?.id
        if (firstCat && window.innerWidth >= 768) {
          setExpandedCategories({ [firstCat]: true })
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  const getSubject = (subjectId) => {
    return data.config?.subjects?.find(s => s.id === subjectId)
  }

  const categories = data.config?.categories || []
  const activeCategories = useMemo(() => {
    return categories.filter(cat => cat.id !== 'assignments' || !showHistory)
  }, [categories, showHistory])

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
          <p className="text-xs text-slate-500">Make sure the server is running at {API_URL}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <Header config={data.config} />

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
              {/* History Card for Assignments */}
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
                onItemClick={setSelectedItem}
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
                onItemClick={setSelectedItem}
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
          onClose={() => setSelectedItem(null)}
        />
      )}

      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-500">My Cust V2 — Auto-synced from Server</p>
        </div>
      </footer>
    </div>
  )
}

export default App

