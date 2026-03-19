'use client'

import Link from 'next/link'

interface NavProps {
  view: 'all' | 'map' | 'list'
  onViewChange: (v: 'all' | 'map' | 'list') => void
  isDark: boolean
  onDarkToggle: () => void
  onAlertOpen: () => void
  onLogoClick?: () => void
}

export function Nav({ view, onViewChange, isDark, onDarkToggle, onAlertOpen, onLogoClick }: NavProps) {
  return (
    <nav
      id="nav"
      className="flex items-center gap-3 px-4 border-b flex-shrink-0 z-50"
      style={{
        height: 'var(--nav-height)',
        background: isDark ? '#0f172a' : 'white',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
      }}
    >
      {/* Logo — clicking resets all filters and returns to home */}
      <button
        id="nav-logo"
        onClick={onLogoClick}
        className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
        style={{ background: 'none', border: 'none', padding: 0 }}
        title="Back to home (clear filters)"
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold text-white">
          D
        </div>
        <span
          className="text-base font-extrabold tracking-tight"
          style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
        >
          DealRadar
        </span>
        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200 ml-0.5">
          Riga
        </span>
      </button>

      <div className="flex-1" />

      {/* View toggles */}
      <div id="view-toggles" className="flex items-center gap-1">
        {[
          { key: 'all', label: '⊟ All' },
          { key: 'map', label: '🗺 Map' },
          { key: 'list', label: '☰ List' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onViewChange(key as 'all' | 'map' | 'list')}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all"
            style={
              view === key
                ? { background: '#6366f1', borderColor: '#6366f1', color: 'white' }
                : {
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    color: isDark ? '#94a3b8' : '#64748b',
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dark/light toggle */}
      <button
        id="mode-toggle"
        onClick={onDarkToggle}
        className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex-shrink-0"
        style={{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          color: isDark ? '#94a3b8' : '#64748b',
        }}
      >
        <span>{isDark ? '☀️' : '🌙'}</span>
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      {/* Alert button */}
      <button
        id="btn-alert"
        onClick={onAlertOpen}
        className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
      >
        🔔 Set Alert
      </button>

      <button
        className="text-[11px] text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          color: isDark ? '#64748b' : '#64748b',
        }}
      >
        Sign in
      </button>
    </nav>
  )
}
