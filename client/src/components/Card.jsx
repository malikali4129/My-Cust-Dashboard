const statusConfig = {
  active: { 
    label: 'Active', 
    class: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-400'
  },
  completed: { 
    label: 'Completed', 
    class: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    dot: 'bg-blue-400'
  },
  archived: { 
    label: 'Archived', 
    class: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
    dot: 'bg-slate-400'
  },
};

const priorityConfig = {
  high: { label: 'High', class: 'text-rose-400' },
  medium: { label: 'Medium', class: 'text-amber-400' },
  low: { label: 'Low', class: 'text-slate-400' },
};

export default function Card({ item, delay = 0 }) {
  const status = statusConfig[item.status] || statusConfig.active;
  const priority = priorityConfig[item.priority] || priorityConfig.medium;

  return (
    <div 
      className="glass-card glass-card-hover p-5 animate-fade-in group"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white/90 line-clamp-1 flex-1 mr-2">{item.title}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border ${status.class} flex items-center gap-1.5 shrink-0`}>
          <span className={`w-1 h-1 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>
      
      <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
        {item.content || 'No description provided.'}
      </p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className={`font-medium ${priority.class}`}>
            {priority.label}
          </span>
          {item.date && (
            <span className="text-slate-500">
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
          {item.tags.map(tag => (
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
  );
}
