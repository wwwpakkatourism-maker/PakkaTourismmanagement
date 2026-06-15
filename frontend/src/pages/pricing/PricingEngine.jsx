import React, { useState } from 'react';
import usePricingStore from '../../store/usePricingStore';

export default function PricingEngine() {
  const { config, setConfig, fmt } = usePricingStore();
  const [local, setLocal] = useState({ ...config, room: {...config.room}, jeep: {...config.jeep}, food: {...config.food}, std: {...config.std} });
  const [saved, setSaved] = useState(false);

  const upd = (section, key, val) => setLocal(p => ({ ...p, [section]: { ...p[section], [key]: parseFloat(val)||0 } }));

  const handleSave = () => { setConfig(local); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const roomProfit  = local.room.sell - local.room.cost;
  const jeepProfit  = local.jeep.sell - local.jeep.cost;
  const foodProfit  = local.food.sell - local.food.cost;

  return (
    <div className="page-content">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 className="page-title">Pricing Engine</h1>
          <p className="page-sub">Configure global pricing for all quotes and tariff matrices</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {saved && <span style={{ color:'var(--color-success)', fontWeight:600, fontSize:'13px' }}>✓ Prices updated globally!</span>}
          <button className="btn btn-success" onClick={handleSave}>💾 Save & Apply</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {/* Custom Pricing Components */}
        <div>
          <div className="card">
            <div className="card-title">🔧 Custom Price Components</div>
            <p style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'20px' }}>These rates are used to calculate day-by-day customized pricing.</p>

            {[
              { key:'room', label:'Hotel Room', icon:'🏨', desc:`Max ${local.room.cap} pax / night`, capKey:'cap' },
              { key:'jeep', label:'Transport Jeep', icon:'🚙', desc:`Max ${local.jeep.cap} pax / day`, capKey:'cap' },
              { key:'food', label:'Food Package', icon:'🍽️', desc:'Per pax / per day', capKey:null },
            ].map(({ key, label, icon, desc, capKey }) => (
              <div key={key} style={{ border:'1px solid var(--color-border)', borderRadius:'14px', padding:'16px', marginBottom:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
                  <span style={{ fontSize:'22px' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'14px' }}>{label}</div>
                    <div style={{ fontSize:'11px', color:'var(--color-text-muted)' }}>{desc}</div>
                  </div>
                  <div style={{ marginLeft:'auto', textAlign:'right' }}>
                    <span style={{ fontSize:'11px', color:'var(--color-text-muted)' }}>Margin</span>
                    <div style={{ fontSize:'16px', fontWeight:700, color: key==='room'?'var(--color-success)':key==='jeep'?'var(--color-accent)':'var(--color-warning)' }}>
                      {fmt(key==='room'?roomProfit:key==='jeep'?jeepProfit:foodProfit)}
                    </div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns: capKey ? '1fr 1fr 1fr' : '1fr 1fr', gap:'10px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color:'var(--color-danger)' }}>Base Cost (₹)</label>
                    <input type="number" className="form-input" value={local[key].cost} onChange={e => upd(key,'cost',e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color:'var(--color-accent)' }}>Sell Price (₹)</label>
                    <input type="number" className="form-input" value={local[key].sell} onChange={e => upd(key,'sell',e.target.value)}/>
                  </div>
                  {capKey && (
                    <div className="form-group">
                      <label className="form-label">Max Pax</label>
                      <input type="number" className="form-input" value={local[key].cap} onChange={e => upd(key,'cap',e.target.value)}/>
                    </div>
                  )}
                </div>
                {/* Profit bar */}
                <div style={{ marginTop:'8px' }}>
                  <div className="progress-wrap">
                    <div className="progress-bar progress-green" style={{ width:`${Math.min(((key==='room'?roomProfit:key==='jeep'?jeepProfit:foodProfit)/local[key].sell)*100,100)}%` }}/>
                  </div>
                  <div style={{ fontSize:'10px', color:'var(--color-text-muted)', marginTop:'3px' }}>
                    {Math.round(((key==='room'?roomProfit:key==='jeep'?jeepProfit:foodProfit)/local[key].sell)*100)}% margin on sell price
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Package */}
        <div>
          <div className="card" style={{ marginBottom:'16px' }}>
            <div className="card-title">📦 Standard Package Logic</div>
            <p style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'20px' }}>Fixed package pricing per person per day, with penalty for small groups.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div className="form-group">
                <label className="form-label">Standard Base Price (₹ / pax / day)</label>
                <input type="number" className="form-input" value={local.std.base} onChange={e => upd('std','base',e.target.value)}/>
                <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginTop:'4px' }}>For 2 days: ₹{local.std.base * 2} per person base price</div>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Pax Required</label>
                <input type="number" className="form-input" value={local.std.min_pax} onChange={e => upd('std','min_pax',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Penalty per Missing Pax (₹ / day)</label>
                <input type="number" className="form-input" value={local.std.inc} onChange={e => upd('std','inc',e.target.value)}/>
                <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginTop:'4px' }}>For 2 days: ₹{local.std.inc * 2} per missing person</div>
              </div>
            </div>

            {/* Live Preview */}
            <div style={{ marginTop:'16px', padding:'14px', background:'var(--color-bg-secondary)', borderRadius:'12px', border:'1px solid var(--color-border)' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Preview — 2 Days</div>
              {[2,4,6,8,10,15,20].map(p => {
                const missing = Math.max(0, local.std.min_pax - p);
                const perHead = local.std.base * 2 + missing * local.std.inc * 2;
                return (
                  <div key={p} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'4px 0', borderBottom:'1px solid var(--color-border)' }}>
                    <span style={{ color:'var(--color-text-muted)' }}>{p} pax{p < local.std.min_pax ? ` (−${missing} penalty)` : ' ✓'}</span>
                    <span style={{ fontWeight:700, color: p >= local.std.min_pax ? 'var(--color-success)' : 'var(--color-warning)' }}>{fmt(perHead)}/head</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Margin Summary */}
          <div className="card" style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.06),rgba(16,185,129,0.06))' }}>
            <div className="card-title">📊 Margin Summary</div>
            {[
              { label:'Room Margin', value: roomProfit, pct: Math.round((roomProfit/local.room.sell)*100) },
              { label:'Jeep Margin', value: jeepProfit, pct: Math.round((jeepProfit/local.jeep.sell)*100) },
              { label:'Food Margin', value: foodProfit, pct: Math.round((foodProfit/local.food.sell)*100) },
            ].map(m => (
              <div key={m.label} style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px', fontSize:'12px' }}>
                  <span style={{ color:'var(--color-text-secondary)' }}>{m.label}</span>
                  <span style={{ fontWeight:700 }}>{fmt(m.value)} ({m.pct}%)</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-bar progress-green" style={{ width:`${Math.min(m.pct,100)}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
