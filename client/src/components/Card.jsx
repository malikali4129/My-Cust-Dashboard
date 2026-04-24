const statusColors = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

const priorityColors = {
  low: 'text-slate-400',
  medium: 'text-amber-400',
  high: 'text-rose-400',
}

export default function Card({ item, index }) {
  const statusClass = statusColors[item.status] || statusColors.active
  const priorityClass = priorityColors[item.priority] || priorityColors.medium
  
  return (
    <div 
      className="group glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-white/90 line-clamp-1 pr-2">{item.title}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide border ${statusClass}`}>
          {item.status}
        </span>
      </div>
      
      <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">{item.content}</p>
      
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className={`font-medium ${priorityClass}`}>{item.priority} priority</span>
        <span>{new Date(item.date).toLocaleDateString()}</span>
      </div>
      
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
