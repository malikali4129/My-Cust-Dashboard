import { useState, useEffect } from 'react'
import Header from './components/Header'
import Section from './components/Section'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8788').replace(/\/$/, '')


function App() {
  const [data, setData] = useState({ config: { categories: [] }, data: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])



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
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {data.config.categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white/90 mb-2">No Categories Yet</h2>
            <p className="text-sm text-slate-400">Visit the dashboard to add categories and items.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {data.config.categories.map((category, index) => (
              <Section 
                key={category.id} 
                category={category} 
                items={data.data[category.id] || []}
                delay={index * 100}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-500">My Cust V2 — Auto-synced from Server</p>
        </div>
      </footer>
    </div>
  )
}

export default App
