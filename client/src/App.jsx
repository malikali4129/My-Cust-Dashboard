import { useState, useEffect } from 'react'
import Header from './components/Header'
import Section from './components/Section'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8788'

function App() {
  const [data, setData] = useState({ config: { categories: [] }, data: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data`)
      if (!res.ok) throw new Error('Failed to fetch data')
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 animate-pulse">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white/90 mb-2">Connection Error</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => { setLoading(true); fetchData() }}
            className="bg-indigo-500/80 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl px-5 py-2.5 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 font-sans">
      <Header config={data.config} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {data.config.categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white/80">No categories configured</h2>
            <p className="text-sm text-slate-500 mt-1">Add categories in the admin dashboard first.</p>
          </div>
        ) : (
          <div className="space-y-12 animate-fade-in">
            {data.config.categories.map((cat, index) => (
              <Section 
                key={cat.id} 
                category={cat} 
                items={data.data[cat.id] || []}
                delay={index * 100}
              />
            ))}
          </div>
        )}
      </main>
      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-slate-500">
          <span>My Cust V2 Client</span>
          <span>Auto-refreshes every 30s</span>
        </div>
      </footer>
    </div>
  )
}

export default App
