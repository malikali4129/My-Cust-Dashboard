import Card from './Card'

const colorMap = {
  indigo: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/20',
  amber: 'text-amber-400 bg-amber-500/20 border-amber-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/20',
  slate: 'text-slate-400 bg-slate-500/20 border-slate-500/20',
  blue: 'text-blue-400 bg-blue-500/20 border-blue-500/20',
  rose: 'text-rose-400 bg-rose-500/20 border-rose-500/20',
}

export default function Section({ category, items, delay = 0 }) {
  const colorClass = colorMap[category.color] || colorMap.slate
  
  return (
    <section className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white/90">{category.label}</h2>
        </div>
        <span className="ml-auto text-sm text-slate-500 font-medium">{items.length} items</span>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-white/5 bg-white/[0.02]">
          <p className="text-sm text-slate-500">No items in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <Card key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}
