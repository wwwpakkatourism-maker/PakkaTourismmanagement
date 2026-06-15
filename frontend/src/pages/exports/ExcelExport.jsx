import React, { useState } from 'react';

const EXPORT_TYPES = [
  { id: 'leads',      label: 'Lead Pipeline',      icon: '🎯', desc: 'All leads with stage, priority, source, follow-up dates',    count: 324, endpoint: '/api/exports/leads' },
  { id: 'bookings',   label: 'Bookings',            icon: '📋', desc: 'Complete booking records with payments and status',           count: 1247, endpoint: '/api/exports/bookings' },
  { id: 'revenue',    label: 'Revenue Report',       icon: '💰', desc: 'Income transactions with breakdown by category',            count: 856, endpoint: '/api/exports/revenue' },
  { id: 'vendors',    label: 'Vendor Payments',      icon: '🏢', desc: 'Vendor payable/paid/outstanding with service details',      count: 7,   endpoint: '/api/exports/vendors' },
  { id: 'attendance', label: 'Attendance Records',   icon: '📅', desc: 'Employee check-in/out, hours worked, work mode',            count: 480, endpoint: '/api/exports/attendance' },
  { id: 'matrix',     label: 'Tariff Matrix',        icon: '📊', desc: '1–50 pax pricing matrix for selected duration',             count: 50,  endpoint: '/api/exports/matrix' },
];

export default function ExcelExport() {
  const [selected, setSelected] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [exporting, setExporting] = useState(null);
  const [completed, setCompleted] = useState([]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(selected.length === EXPORT_TYPES.length ? [] : EXPORT_TYPES.map(e => e.id));
  };

  const handleExport = async (id) => {
    setExporting(id);
    // Simulate export
    await new Promise(r => setTimeout(r, 1500));
    setCompleted(prev => [...prev, id]);
    setExporting(null);
  };

  const handleBulkExport = async () => {
    for (const id of selected) {
      await handleExport(id);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Excel Export</h1>
          <p className="page-sub">Export business data as formatted Excel spreadsheets</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={selectAll}>
            {selected.length === EXPORT_TYPES.length ? '☐ Deselect All' : '☑ Select All'}
          </button>
          <button className="btn btn-primary" onClick={handleBulkExport} disabled={selected.length === 0 || exporting}>
            📥 Export Selected ({selected.length})
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card card-sm" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '13px' }}>📅 Date Range:</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="date" className="form-input" style={{ width: '160px', padding: '6px 10px' }}
            value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
          <span style={{ color: 'var(--color-text-muted)' }}>to</span>
          <input type="date" className="form-input" style={{ width: '160px', padding: '6px 10px' }}
            value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Leave empty for all-time data</span>
      </div>

      {/* Export Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '12px' }}>
        {EXPORT_TYPES.map(exp => {
          const isSelected = selected.includes(exp.id);
          const isExporting = exporting === exp.id;
          const isDone = completed.includes(exp.id);

          return (
            <div key={exp.id} className="card" style={{
              cursor: 'pointer',
              border: `1.5px solid ${isSelected ? 'var(--color-accent)' : isDone ? 'var(--color-success-border)' : 'var(--color-border)'}`,
              background: isDone ? 'var(--color-success-bg)' : isSelected ? 'var(--color-accent-subtle)' : undefined,
              transition: 'all 0.2s',
            }} onClick={() => toggleSelect(exp.id)}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center',
                    fontSize: '22px', background: 'var(--color-bg-secondary)', flexShrink: 0
                  }}>{exp.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{exp.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{exp.count} records</div>
                  </div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '4px',
                  border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: isSelected ? 'var(--color-accent)' : 'transparent',
                  display: 'grid', placeItems: 'center', flexShrink: 0
                }}>
                  {isSelected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                </div>
              </div>

              {/* Description */}
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                {exp.desc}
              </div>

              {/* Action */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={`btn btn-sm ${isDone ? 'btn-success' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); handleExport(exp.id); }}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <><div className="spinner spinner-sm" /> Exporting…</>
                  ) : isDone ? (
                    '✅ Downloaded'
                  ) : (
                    '📥 Export .xlsx'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export History */}
      {completed.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-title">✅ Recently Exported</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {completed.map(id => {
              const exp = EXPORT_TYPES.find(e => e.id === id);
              return (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  background: 'var(--color-success-bg)', borderRadius: '8px',
                  border: '1px solid var(--color-success-border)', fontSize: '13px'
                }}>
                  <span>{exp.icon}</span>
                  <span style={{ fontWeight: 600 }}>{exp.label}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{exp.count} records</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-success)' }}>✓ Just now</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
