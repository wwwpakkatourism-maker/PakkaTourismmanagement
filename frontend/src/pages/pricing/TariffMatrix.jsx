import React, { useState, useMemo } from 'react';
import usePricingStore from '../../store/usePricingStore';

export default function TariffMatrix() {
  const { config, matrix, matrixDays, setMatrixDays, setConfig, fmt } = usePricingStore();
  const { user } = { user: JSON.parse(localStorage.getItem('pt_user') || '{}') };
  const isAdmin = ['admin','super_admin'].includes(user?.role);

  const [highlightPax, setHighlightPax] = useState(null);
  const [showPricingPanel, setShowPricingPanel] = useState(false);
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  const DAYS_OPTIONS = [1,2,3,4,5,6,7,8,9,10].map(d => ({
    value: d, label: d === 1 ? '1 Day (No Stay)' : `${d} Days / ${d-1} Night${d>2?'s':''}`
  }));

  const handleSave = () => {
    setConfig({
      room: { cost: +localConfig.room.cost, sell: +localConfig.room.sell, cap: +localConfig.room.cap },
      jeep: { cost: +localConfig.jeep.cost, sell: +localConfig.jeep.sell, cap: +localConfig.jeep.cap },
      food: { cost: +localConfig.food.cost, sell: +localConfig.food.sell },
      std:  { base: +localConfig.std.base, min_pax: +localConfig.std.min_pax, inc: +localConfig.std.inc },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const highlightRow = matrix[highlightPax != null ? highlightPax - 1 : -1];

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 className="page-title">Tariff Matrix</h1>
          <p className="page-sub">Customized vs Standard pricing — 1 to 50 pax comparison</p>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
          <select className="form-select" style={{ width:'220px' }} value={matrixDays} onChange={e => setMatrixDays(parseInt(e.target.value))}>
            {DAYS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPricingPanel(!showPricingPanel)}>
              ⚙️ {showPricingPanel ? 'Hide' : 'Edit'} Pricing
            </button>
          )}
        </div>
      </div>

      {/* Pricing Config Panel (Admin Only) */}
      {showPricingPanel && isAdmin && (
        <div className="card" style={{ marginBottom:'16px', background:'linear-gradient(135deg,rgba(37,99,235,0.04),rgba(16,185,129,0.04))' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <div className="card-title" style={{ marginBottom:0 }}>⚙️ Global Pricing Master</div>
            <div style={{ display:'flex', gap:'8px' }}>
              {saved && <span style={{ fontSize:'12px', color:'var(--color-success)', fontWeight:600 }}>✓ Saved!</span>}
              <button className="btn btn-success btn-sm" onClick={handleSave}>💾 Update Prices</button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px' }}>
            {/* Custom Pricing */}
            <div>
              <div style={{ fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-text-muted)', marginBottom:'12px' }}>Custom Price Components (Per Day)</div>
              {[
                { key:'room', label:'Hotel Room', sub:`Max ${localConfig.room.cap} pax/night` },
                { key:'jeep', label:'Transport Jeep', sub:`Max ${localConfig.jeep.cap} pax/day` },
                { key:'food', label:'Food Package', sub:'Per pax / day' },
              ].map(({ key, label, sub }) => (
                <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 100px 100px', gap:'8px', alignItems:'center', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:600 }}>{label}</div>
                    <div style={{ fontSize:'11px', color:'var(--color-text-muted)' }}>{sub}</div>
                  </div>
                  <div>
                    <label className="form-label" style={{ color:'var(--color-danger)' }}>Base Cost</label>
                    <input type="number" className="form-input" style={{ padding:'6px 8px', textAlign:'center' }}
                      value={localConfig[key].cost}
                      onChange={e => setLocalConfig(p => ({ ...p, [key]: { ...p[key], cost: e.target.value }}))}/>
                  </div>
                  <div>
                    <label className="form-label" style={{ color:'var(--color-accent)' }}>Sell Price</label>
                    <input type="number" className="form-input" style={{ padding:'6px 8px', textAlign:'center' }}
                      value={localConfig[key].sell}
                      onChange={e => setLocalConfig(p => ({ ...p, [key]: { ...p[key], sell: e.target.value }}))}/>
                  </div>
                </div>
              ))}
            </div>
            {/* Standard Package */}
            <div>
              <div style={{ fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-text-muted)', marginBottom:'12px' }}>Standard Package Logic (Per Day)</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div className="form-group">
                  <label className="form-label">Base Price / Pax / Day</label>
                  <input type="number" className="form-input" value={localConfig.std.base} onChange={e => setLocalConfig(p => ({ ...p, std:{ ...p.std, base: e.target.value }}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Pax Required</label>
                  <input type="number" className="form-input" value={localConfig.std.min_pax} onChange={e => setLocalConfig(p => ({ ...p, std:{ ...p.std, min_pax: e.target.value }}))}/>
                </div>
                <div className="form-group full">
                  <label className="form-label">Penalty per Missing Pax / Day</label>
                  <input type="number" className="form-input" value={localConfig.std.inc} onChange={e => setLocalConfig(p => ({ ...p, std:{ ...p.std, inc: e.target.value }}))}/>
                  <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginTop:'4px' }}>
                    Preview for {matrixDays}D: If pax &lt; {localConfig.std.min_pax}, add ₹{localConfig.std.inc * matrixDays} per missing person
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Lookup */}
      <div className="card card-sm" style={{ marginBottom:'16px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ fontSize:'13px', fontWeight:600 }}>🔍 Quick Lookup:</div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <label className="form-label" style={{ margin:0, whiteSpace:'nowrap' }}>Pax:</label>
          <input type="number" className="form-input" style={{ width:'80px', padding:'6px 8px' }}
            min="1" max="50" value={highlightPax || ''} placeholder="e.g. 15"
            onChange={e => setHighlightPax(e.target.value ? parseInt(e.target.value) : null)}/>
        </div>
        {highlightRow && (
          <div style={{ display:'flex', gap:'16px', flex:1, flexWrap:'wrap', fontSize:'13px' }}>
            <span>Custom: <strong className="text-accent">{fmt(highlightRow.custom.total)}</strong> ({fmt(highlightRow.custom.perHead)}/head)</span>
            <span>Standard: <strong style={{ color:'#7C3AED' }}>{fmt(highlightRow.standard.total)}</strong> ({fmt(highlightRow.standard.perHead)}/head)</span>
            {isAdmin && <span>Profit: <strong className="text-success">{fmt(highlightRow.admin.customProfit)}</strong> ({highlightRow.admin.profitMargin}%)</span>}
          </div>
        )}
      </div>

      {/* Matrix Table */}
      <div className="table-card" style={{ height:'calc(100vh - 300px)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ overflowX:'auto', overflowY:'auto', flex:1 }}>
          <table className="ds-table" style={{ fontSize:'12px', whiteSpace:'nowrap' }}>
            <thead>
              <tr style={{ background:'var(--color-bg-secondary)' }}>
                <th rowSpan={2} style={{ background:'var(--color-bg-surface)', position:'sticky',left:0,zIndex:11,textAlign:'center',minWidth:'52px' }}>Pax</th>
                <th colSpan={4} style={{ textAlign:'center', background:'#F1F5F9', borderLeft:'1px solid var(--color-border)' }}>Logistics</th>
                <th colSpan={2} style={{ textAlign:'center', background:'#EFF6FF', borderLeft:'1px solid var(--color-border)', color:'#1D4ED8' }}>Customized Price</th>
                <th colSpan={2} style={{ textAlign:'center', background:'#F5F3FF', borderLeft:'1px solid var(--color-border)', color:'#7C3AED' }}>Standard Package</th>
                <th colSpan={2} style={{ textAlign:'center', background:'#FFFBEB', borderLeft:'1px solid var(--color-border)', color:'#D97706' }}>Difference</th>
                {isAdmin && <th colSpan={2} style={{ textAlign:'center', background:'#FEF2F2', borderLeft:'1px solid var(--color-border)', color:'#DC2626' }}>Admin View</th>}
              </tr>
              <tr style={{ background:'var(--color-bg-secondary)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                <th style={{ borderLeft:'1px solid var(--color-border)', textAlign:'center' }}>Rooms</th>
                <th style={{ textAlign:'center' }}>Jeeps</th>
                <th style={{ textAlign:'right' }}>Food</th>
                <th style={{ textAlign:'right', borderRight:'1px solid var(--color-border)' }}>Total Cost</th>
                <th style={{ textAlign:'right', background:'rgba(59,130,246,0.06)' }}>Total</th>
                <th style={{ textAlign:'right', background:'rgba(59,130,246,0.1)', borderRight:'1px solid var(--color-border)' }}>Per Head</th>
                <th style={{ textAlign:'right', background:'rgba(124,58,237,0.06)' }}>Total</th>
                <th style={{ textAlign:'right', background:'rgba(124,58,237,0.1)', borderRight:'1px solid var(--color-border)' }}>Per Head</th>
                <th style={{ textAlign:'right', background:'rgba(245,158,11,0.06)' }}>Total Diff</th>
                <th style={{ textAlign:'right', background:'rgba(245,158,11,0.1)', borderRight:'1px solid var(--color-border)' }}>Head Diff</th>
                {isAdmin && <>
                  <th style={{ textAlign:'right', background:'rgba(220,38,38,0.06)' }}>Base Cost</th>
                  <th style={{ textAlign:'right', background:'rgba(5,150,105,0.1)' }}>Max Profit</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => {
                const isHighlighted = row.pax === highlightPax;
                const diffColor = row.diff.total > 0 ? '#DC2626' : '#059669';
                return (
                  <tr key={row.pax}
                    onClick={() => setHighlightPax(row.pax === highlightPax ? null : row.pax)}
                    style={{
                      background: isHighlighted ? 'rgba(59,130,246,0.06)' : row.pax % 5 === 0 ? 'var(--color-bg-secondary)' : undefined,
                      cursor: 'pointer',
                      outline: isHighlighted ? '2px solid #3B82F6' : 'none',
                      outlineOffset: '-1px'
                    }}
                  >
                    <td style={{ fontWeight:800, textAlign:'center', background:'var(--color-bg-surface)', position:'sticky', left:0, zIndex:5, borderRight:'1px solid var(--color-border)', boxShadow:'2px 0 4px rgba(0,0,0,0.04)' }}>
                      <span style={{ color: isHighlighted ? 'var(--color-accent)' : undefined }}>{row.pax}</span>
                    </td>
                    <td style={{ textAlign:'center', borderLeft:'1px solid var(--color-border-light)' }}>
                      <span style={{ fontWeight:600 }}>{row.logistics.rooms}</span>
                      <span style={{ display:'block', fontSize:'10px', color:'var(--color-text-muted)' }}>{fmt(row.logistics.roomSell)}</span>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <span style={{ fontWeight:600 }}>{row.logistics.jeeps}</span>
                      <span style={{ display:'block', fontSize:'10px', color:'var(--color-text-muted)' }}>{fmt(row.logistics.jeepSell)}</span>
                    </td>
                    <td style={{ textAlign:'right', color:'var(--color-text-secondary)' }}>{fmt(row.logistics.foodSell)}</td>
                    <td style={{ textAlign:'right', color:'var(--color-text-muted)', borderRight:'1px solid var(--color-border)' }}>{fmt(row.logistics.roomSell+row.logistics.jeepSell+row.logistics.foodSell)}</td>
                    <td style={{ textAlign:'right', fontWeight:600, background:'rgba(59,130,246,0.04)' }}>{fmt(row.custom.total)}</td>
                    <td style={{ textAlign:'right', fontWeight:800, color:'#1D4ED8', background:'rgba(59,130,246,0.08)', borderRight:'1px solid var(--color-border)' }}>{fmt(row.custom.perHead)}</td>
                    <td style={{ textAlign:'right', fontWeight:600, background:'rgba(124,58,237,0.04)' }}>{fmt(row.standard.total)}</td>
                    <td style={{ textAlign:'right', fontWeight:800, color:'#7C3AED', background:'rgba(124,58,237,0.08)', borderRight:'1px solid var(--color-border)' }}>{fmt(row.standard.perHead)}</td>
                    <td style={{ textAlign:'right', fontWeight:700, color: diffColor, background:'rgba(245,158,11,0.04)' }}>{row.diff.total > 0 ? '+' : ''}{fmt(row.diff.total)}</td>
                    <td style={{ textAlign:'right', fontWeight:700, color: diffColor, background:'rgba(245,158,11,0.08)', borderRight:'1px solid var(--color-border)' }}>{row.diff.perHead > 0 ? '+' : ''}{fmt(row.diff.perHead)}</td>
                    {isAdmin && <>
                      <td style={{ textAlign:'right', color:'#DC2626', fontWeight:500, background:'rgba(220,38,38,0.04)' }}>{fmt(row.admin.totalCost)}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color:'#059669', background:'rgba(5,150,105,0.08)' }}>{fmt(row.admin.customProfit)}</td>
                    </>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ padding:'8px 16px', borderTop:'1px solid var(--color-border)', display:'flex', gap:'16px', fontSize:'11px', color:'var(--color-text-muted)', flexWrap:'wrap' }}>
          {[
            { color:'rgba(59,130,246,0.15)', label:'Custom Pricing' },
            { color:'rgba(124,58,237,0.15)', label:'Standard Package' },
            { color:'rgba(245,158,11,0.15)',  label:'Price Difference' },
            ...(isAdmin ? [{ color:'rgba(220,38,38,0.15)', label:'Admin Tracking' }] : []),
          ].map(l => (
            <span key={l.label} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <span style={{ width:10, height:10, borderRadius:'2px', background: l.color, border:'1px solid rgba(0,0,0,0.1)' }}/>
              {l.label}
            </span>
          ))}
          <span style={{ marginLeft:'auto' }}>Click any row to highlight • {matrixDays} Day{matrixDays>1?'s':''} trip</span>
        </div>
      </div>
    </div>
  );
}
