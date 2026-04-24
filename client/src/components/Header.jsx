export default function Header({ config }) {
  const totalItems = config.categories?.length || 0
  
  return (
    <header className="border-b border-white/5 bg-white/5 backdrop-blur-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white/90">My Cust</h1>
            <p className="text-[10px] text-slate-500">Live Dashboard Data</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
          <div className="text-xs text-slate-500">
            {totalItems} {totalItems === 1 ? 'category' : 'categories'}
          </div>
        </div>
      </div>
    </header>
  )
}
