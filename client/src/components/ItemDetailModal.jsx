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

export default function ItemDetailModal({ item, subject, onClose }) {
  if (!item) return null;

  const status = statusConfig[item.status] || statusConfig.active;
  const priority = priorityConfig[item.priority] || priorityConfig.medium;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border ${status.class} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className={`text-xs font-medium ${priority.class}`}>{priority.label} Priority</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white/90 leading-tight">{item.title}</h2>
            {subject && (
              <p className="text-sm text-indigo-300 mt-1.5 font-medium">
                {subject.name} <span className="text-indigo-300/60">({subject.code})</span>
              </p>
            )}
          </div>

          {item.content && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{item.content}</p>
            </div>
          )}

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-3">
            {item.date && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">Posted</p>
                <p className="text-sm text-slate-200">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
            {item.deadline && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-rose-400/70 font-medium mb-1">Deadline</p>
                <p className="text-sm text-rose-200">
                  {new Date(item.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
              <p className="text-[10px] uppercase tracking-wider text-amber-400/70 font-medium mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notes
              </p>
              <p className="text-sm text-amber-100/80 whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            {item.materialUrl && (
              <a
                href={item.materialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Material
              </a>
            )}
            {item.externalLink && (
              <a
                href={item.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Material
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

