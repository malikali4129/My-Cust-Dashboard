import Card from './Card';

const colorMap = {
  indigo: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
  amber: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  rose: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
  blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  slate: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
};

const iconMap = {
  megaphone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  'clipboard-list': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  'check-circle': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  archive: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

export default function Section({ category, items, subjects, isExpanded, onToggle, onItemClick, onItemDelete, delay = 0 }) {
  const colorClass = colorMap[category.color] || colorMap.slate;
  const icon = iconMap[category.icon] || iconMap.folder;

  const getSubject = (subjectId) => subjects.find(s => s.id === subjectId);

  return (
    <section className="animate-slide-up" style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 mb-4 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-lg sm:text-xl font-bold text-white/90">{category.label}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <div className={`p-2 rounded-lg bg-white/5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          {items.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-slate-500">No items in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item, idx) => (
                <Card
                  key={item.id}
                  item={item}
                  subject={getSubject(item.subjectId)}
                  onClick={() => onItemClick(item)}
                  onDelete={onItemDelete ? () => onItemDelete(item.id) : undefined}
                  delay={idx * 50}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

