const colorStyles = {
  indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-300',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300',
  slate: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-300',
};

const iconMap = {
  megaphone: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  'clipboard-list': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  'check-circle': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  folder: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

export default function CategorySummaryCard({ category, count, isExpanded, onToggle }) {
  const style = colorStyles[category.color] || colorStyles.slate;
  const icon = iconMap[category.icon] || iconMap.folder;

  return (
    <button
      onClick={onToggle}
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border bg-gradient-to-br ${style} backdrop-blur-md transition-all duration-300 active:scale-95 min-h-[110px] min-w-[100px] flex-1 ${
        isExpanded ? 'ring-2 ring-white/20 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="mb-2 opacity-90">{icon}</div>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{category.label}</span>
      <span className="text-2xl font-bold mt-1">{count}</span>
      <span className="text-[10px] opacity-60 mt-0.5">{count === 1 ? 'item' : 'items'}</span>
      {isExpanded && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/40" />
      )}
    </button>
  );
}

