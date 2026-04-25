const statusConfig = {
  active: { label: 'Active', class: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', dot: 'bg-emerald-400' },
  completed: { label: 'Completed', class: 'bg-blue-500/15 text-blue-300 border-blue-500/20', dot: 'bg-blue-400' },
  archived: { label: 'Archived', class: 'bg-slate-500/15 text-slate-300 border-slate-500/20', dot: 'bg-slate-400' },
};

const priorityConfig = {
  high: { label: 'High', class: 'text-rose-400' },
  medium: { label: 'Medium', class: 'text-amber-400' },
  low: { label: 'Low', class: 'text-slate-400' },
};

export default function Card({ item, subject, onClick, delay = 0 }) {
  const status = statusConfig[item.status] || statusConfig.active;
  const priority = priorityConfig[item.priority] || priorityConfig.medium;

  const isOverdue = item.deadline && new Date(item.deadline) < new Date() && item.status !== 'completed';

  return (
    <div
      onClick={onClick}
      className="glass-card p-4 sm:p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 cursor-pointer active:scale-[0.98] animate-fade-in group"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between mb-2.5">
        <h3 className="font-semibold text-white/90 line-clamp-1 flex-1 mr-2 text-sm sm:text-base">{item.title}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border ${status.class} flex items-center gap-1.5 shrink-0`}>
          <span className={`w-1 h-1 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {subject && (
        <p className="text-[11px] text-indigo-300/80 mb-2 truncate">{subject.name} ({subject.code})</p>
      )}

      <p className="text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed">
        {item.content || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`font-medium ${priority.class}`}>{priority.label}</span>
          {item.date && (
            <span className="text-slate-500 hidden sm:inline">
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {item.deadline && (
        <div className={`mt-2.5 flex items-center gap-1.5 text-xs ${isOverdue ? 'text-rose-300' : 'text-slate-400'}`}>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md text-slate-500">+{item.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

