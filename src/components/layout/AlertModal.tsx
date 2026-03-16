'use client'

interface AlertModalProps {
  open: boolean
  onClose: () => void
  isDark: boolean
}

export function AlertModal({ open, onClose, isDark }: AlertModalProps) {
  if (!open) return null

  const labelStyle = { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', display: 'block', marginBottom: 5 }
  const inputStyle = { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#1e293b', background: 'white', outline: 'none' }
  const selectStyle = { ...inputStyle, cursor: 'pointer' }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        id="alert-modal-inner"
        style={{
          background: 'white', borderRadius: 20, padding: 24,
          width: '100%', maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Set a listing alert</h2>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18 }}>Get notified when a matching listing appears</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div id="alert-area">
            <span style={labelStyle}>Area</span>
            <div style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 10, padding: 12, textAlign: 'center', fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>
              ✏️ Draw on map, or leave blank for all of Riga
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div id="alert-min-price">
              <span style={labelStyle}>Min price (€)</span>
              <input type="number" placeholder="0" style={inputStyle} />
            </div>
            <div id="alert-max-price">
              <span style={labelStyle}>Max price (€)</span>
              <input type="number" placeholder="Any" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div id="alert-rooms">
              <span style={labelStyle}>Min rooms</span>
              <select style={selectStyle}>
                <option>Any</option><option>1</option><option>2</option><option>3</option><option>4+</option>
              </select>
            </div>
            <div id="alert-freq">
              <span style={labelStyle}>Frequency</span>
              <select style={selectStyle}>
                <option>Instant (hourly)</option>
                <option>Daily digest</option>
              </select>
            </div>
          </div>

          <div id="alert-email">
            <span style={labelStyle}>Your email</span>
            <input type="email" placeholder="you@email.com" style={inputStyle} />
          </div>
        </div>

        <div id="alert-actions" style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button style={{ flex: 1, padding: 11, borderRadius: 10, background: '#6366f1', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            Activate alert
          </button>
        </div>
      </div>
    </div>
  )
}
