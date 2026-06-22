import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import usePricingStore from '../../store/usePricingStore';

export default function QuoteBuilder() {
  const { config, calculate, fmt } = usePricingStore();
  const [form, setForm] = useState({
    clientName:'', clientPhone:'', destination:'Manali, HP',
    days: 2, pax: 4, travelDate: '', mode:'custom', markup: 0,
  });
  const [quote, setQuote] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const quoteRef = useRef(null);

  // ── PDF Export ──
  const exportQuotePDF = async () => {
    if (!quote) { alert('Please calculate a quote first!'); return; }
    setExporting(true);
    try {
      const el = quoteRef.current;
      if (!el) { setExporting(false); return; }
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = pdfW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let pos = 10;
      pdf.addImage(imgData, 'PNG', 10, pos, imgW, imgH);
      heightLeft -= (pdfH - 20);
      while (heightLeft > 0) {
        pos = heightLeft - imgH + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, pos, imgW, imgH);
        heightLeft -= (pdfH - 20);
      }
      const filename = `Quote_${(form.clientName || 'Client').replace(/\s+/g,'_')}_${form.destination.replace(/\s+/g,'_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('❌ PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  const nights = form.days > 1 ? form.days - 1 : 0;

  const handleCalc = () => {
    const result = calculate(parseInt(form.pax), parseInt(form.days));
    setQuote(result);
    setShowPreview(true);
  };

  const sellPrice = quote ? (form.mode === 'custom' ? quote.custom.total : quote.standard.total) : 0;
  const profit    = quote ? sellPrice - quote.admin.totalCost : 0;
  const margin    = sellPrice > 0 ? ((profit / sellPrice) * 100).toFixed(1) : 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Quote Builder</h1>
        <p className="page-sub">Build, compare, and send professional travel quotations</p>
      </div>

      {/* Main layout — stacks on mobile: form above, results below */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px' }}>

        {/* ── Left: Input Form ── */}
        <div>
          <div className="card" style={{ marginBottom:'16px' }}>
            <div className="card-title">Client Details</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div className="form-group"><label className="form-label">Client Name *</label><input className="form-input" placeholder="Rajesh Kumar" value={form.clientName} onChange={e=>setForm(f=>({...f,clientName:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" placeholder="9876543210" value={form.clientPhone} onChange={e=>setForm(f=>({...f,clientPhone:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Destination</label><input className="form-input" value={form.destination} onChange={e=>setForm(f=>({...f,destination:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Travel Date</label><input type="date" className="form-input" value={form.travelDate} onChange={e=>setForm(f=>({...f,travelDate:e.target.value}))}/></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom:'16px' }}>
            <div className="card-title">Trip Configuration</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div className="form-group">
                <label className="form-label">Duration (Days)</label>
                <select className="form-select" value={form.days} onChange={e=>setForm(f=>({...f,days:parseInt(e.target.value)}))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(d=><option key={d} value={d}>{d} Day{d>1?'s':''}{d>1?` / ${d-1} Night${d>2?'s':''}`:''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pax Count</label>
                <input type="number" className="form-input" min="1" max="50" value={form.pax} onChange={e=>setForm(f=>({...f,pax:e.target.value}))}/>
              </div>
            </div>
            <div style={{ marginTop:'12px' }}>
              <label className="form-label">Pricing Mode</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {[{v:'custom',l:'🔧 Customized'},{v:'standard',l:'📦 Standard Package'}].map(m=>(
                  <button key={m.v} type="button"
                    className={`btn ${form.mode===m.v?'btn-primary':'btn-secondary'} btn-sm`}
                    style={{ justifyContent:'center' }}
                    onClick={()=>setForm(f=>({...f,mode:m.v}))}>
                    {m.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom:'16px' }}>
            <div className="card-title">Pricing Reference</div>
            <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', display:'flex', flexDirection:'column', gap:'6px' }}>
              {[
                ['Room Rate', `${fmt(config.room.sell)}/room/night (${config.room.cap} pax max)`],
                ['Jeep Rate', `${fmt(config.jeep.sell)}/jeep/day (${config.jeep.cap} pax max)`],
                ['Food Rate', `${fmt(config.food.sell)}/pax/day`],
                ['Std Package', `${fmt(config.std.base * form.days)}/pax base for ${form.days}D`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--color-border)' }}>
                  <span style={{ color:'var(--color-text-muted)' }}>{k}</span>
                  <span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px' }} onClick={handleCalc}>
            🧮 Calculate Quote
          </button>
        </div>

        {/* ── Right: Live Quote Preview ── */}
        <div>
          {!quote ? (
            <div className="card empty-state" style={{ height:'100%' }}>
              <div className="empty-icon">📋</div>
              <div className="empty-title">Quote Preview</div>
              <div className="empty-sub">Fill in the client details and trip configuration, then click Calculate Quote to see a full breakdown.</div>
            </div>
          ) : (
            <>
              {/* Quote Header */}
              <div className="card" style={{ marginBottom:'16px', background:'linear-gradient(135deg,rgba(37,99,235,0.04),rgba(16,185,129,0.04))' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
                  <div>
                    <div style={{ fontSize:'11px', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Quotation For</div>
                    <div style={{ fontSize:'22px', fontWeight:800, marginTop:'4px' }}>{form.clientName || 'Client Name'}</div>
                    <div style={{ fontSize:'13px', color:'var(--color-text-muted)' }}>📍 {form.destination} · {form.days}D/{nights}N · {form.pax} Pax</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:'11px', color:'var(--color-text-muted)' }}>Total Amount</div>
                    <div style={{ fontSize:'32px', fontWeight:800, color:'var(--color-accent)' }}>{fmt(sellPrice)}</div>
                    <div style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{fmt(Math.round(sellPrice/form.pax))}/per head</div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Table */}
              <div className="table-card" style={{ marginBottom:'16px' }}>
                <div className="table-toolbar"><div className="card-title" style={{ margin:0 }}>Cost Breakdown</div></div>
                <table className="ds-table">
                  <thead><tr><th>Component</th><th>Qty</th><th style={{ textAlign:'right' }}>Base Cost</th><th style={{ textAlign:'right' }}>Sell Price</th><th style={{ textAlign:'right' }}>Profit</th></tr></thead>
                  <tbody>
                    {nights > 0 && (
                      <tr>
                        <td><strong>Hotel Rooms</strong><span style={{ display:'block', fontSize:'11px', color:'var(--color-text-muted)' }}>{quote.logistics.rooms} rooms × {nights} nights</span></td>
                        <td>{quote.logistics.rooms}</td>
                        <td className="mono" style={{ textAlign:'right', color:'var(--color-danger)' }}>{fmt(quote.logistics.rooms * nights * config.room.cost)}</td>
                        <td className="mono" style={{ textAlign:'right', color:'var(--color-accent)' }}>{fmt(quote.logistics.roomSell)}</td>
                        <td className="mono" style={{ textAlign:'right', color:'var(--color-success)', fontWeight:600 }}>{fmt(quote.logistics.roomSell - quote.logistics.rooms * nights * config.room.cost)}</td>
                      </tr>
                    )}
                    <tr>
                      <td><strong>Transport (Jeeps)</strong><span style={{ display:'block', fontSize:'11px', color:'var(--color-text-muted)' }}>{quote.logistics.jeeps} jeeps × {form.days} days</span></td>
                      <td>{quote.logistics.jeeps}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-danger)' }}>{fmt(quote.logistics.jeeps * form.days * config.jeep.cost)}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-accent)' }}>{fmt(quote.logistics.jeepSell)}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-success)', fontWeight:600 }}>{fmt(quote.logistics.jeepSell - quote.logistics.jeeps * form.days * config.jeep.cost)}</td>
                    </tr>
                    <tr>
                      <td><strong>Food Package</strong><span style={{ display:'block', fontSize:'11px', color:'var(--color-text-muted)' }}>{form.pax} pax × {form.days} days</span></td>
                      <td>{form.pax}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-danger)' }}>{fmt(parseInt(form.pax) * form.days * config.food.cost)}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-accent)' }}>{fmt(quote.logistics.foodSell)}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-success)', fontWeight:600 }}>{fmt(quote.logistics.foodSell - parseInt(form.pax) * form.days * config.food.cost)}</td>
                    </tr>
                    <tr style={{ background:'var(--color-bg-secondary)', fontWeight:700 }}>
                      <td>TOTAL</td>
                      <td/>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-danger)' }}>{fmt(quote.admin.totalCost)}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-accent)' }}>{fmt(quote.custom.total)}</td>
                      <td className="mono" style={{ textAlign:'right', color:'var(--color-success)' }}>{fmt(quote.admin.customProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Profit Analysis */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:'12px', marginBottom:'16px' }}>
                {[
                  { label:'Sell Price', value: fmt(sellPrice), color:'var(--color-accent)', icon:'💰' },
                  { label:'Net Profit', value: fmt(profit), color:'var(--color-success)', icon:'📈' },
                  { label:'Margin %', value: `${margin}%`, color: parseFloat(margin) >= 20 ? 'var(--color-success)' : 'var(--color-warning)', icon:'🎯' },
                ].map(s => (
                  <div key={s.label} className="card card-sm" style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'20px', marginBottom:'4px' }}>{s.icon}</div>
                    <div style={{ fontSize:'18px', fontWeight:800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginTop:'2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Standard vs Custom Comparison */}
              <div className="card">
                <div className="card-title">Custom vs Standard Comparison</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {[
                    { label:'Customized', total: quote.custom.total, perHead: quote.custom.perHead, color:'#2563EB', active: form.mode==='custom' },
                    { label:'Standard Package', total: quote.standard.total, perHead: quote.standard.perHead, color:'#7C3AED', active: form.mode==='standard' },
                  ].map(s => (
                    <div key={s.label} onClick={() => setForm(f => ({ ...f, mode: s.label === 'Customized' ? 'custom' : 'standard' }))}
                      style={{
                        padding:'16px', borderRadius:'12px', border:`2px solid ${s.active ? s.color : 'var(--color-border)'}`,
                        background: s.active ? `${s.color}08` : 'var(--color-bg-secondary)', cursor:'pointer', transition:'all 0.2s'
                      }}>
                      <div style={{ fontSize:'12px', fontWeight:600, color: s.active ? s.color : 'var(--color-text-muted)', marginBottom:'8px' }}>{s.active ? '✓ ' : ''}{s.label}</div>
                      <div style={{ fontSize:'22px', fontWeight:800, color: s.color }}>{fmt(s.total)}</div>
                      <div style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{fmt(s.perHead)} / person</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display:'flex', gap:'8px', marginTop:'16px', flexWrap:'wrap' }}>
                <button className="btn btn-success" style={{ flex:1, justifyContent:'center' }}>💾 Save Quote</button>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>📤 Send to Client</button>
                <button className="btn btn-secondary" onClick={exportQuotePDF} disabled={exporting}>
                  {exporting ? '⟳ Exporting…' : '🖨️ PDF'}
                </button>
              </div>

              {/* Hidden PDF-Ready Print Layout */}
              <div style={{ position:'absolute', left:'-9999px', top:0 }}>
                <div ref={quoteRef} style={{ width:'700px', padding:'40px', background:'#fff', color:'#1F2937', fontFamily:'Inter, system-ui, sans-serif' }}>
                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingBottom:'20px', borderBottom:'3px solid #2563EB', marginBottom:'24px' }}>
                    <div>
                      <div style={{ fontSize:'26px', fontWeight:800, color:'#1E3A5F' }}>🏔️ Pakka Tourism</div>
                      <div style={{ fontSize:'10px', color:'#64748B', letterSpacing:'0.06em', textTransform:'uppercase' }}>Your Trusted Travel Partner</div>
                    </div>
                    <div style={{ textAlign:'right', fontSize:'11px', color:'#6B7280' }}>
                      <div style={{ fontWeight:700, fontSize:'16px', color:'#2563EB' }}>QUOTATION</div>
                      <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'24px', gap:'20px', flexWrap:'wrap' }}>
                    <div style={{ fontSize:'13px' }}>
                      <div style={{ fontWeight:700, marginBottom:'4px', color:'#374151' }}>Quotation For:</div>
                      <div style={{ fontSize:'20px', fontWeight:800, color:'#111827' }}>{form.clientName || 'Client Name'}</div>
                      <div style={{ color:'#6B7280' }}>📞 {form.clientPhone || '—'}</div>
                    </div>
                    <div style={{ textAlign:'right', fontSize:'13px' }}>
                      <div>📍 <strong>{form.destination}</strong></div>
                      <div>{form.days}D / {nights}N · {form.pax} Pax</div>
                      {form.travelDate && <div>🗓️ {new Date(form.travelDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>}
                    </div>
                  </div>

                  {/* Cost Breakdown Table */}
                  <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'20px', fontSize:'13px' }}>
                    <thead>
                      <tr style={{ background:'#1D4ED8', color:'#fff' }}>
                        <th style={{ padding:'10px 12px', textAlign:'left', borderRadius:'8px 0 0 0' }}>Component</th>
                        <th style={{ padding:'10px 12px', textAlign:'center' }}>Qty</th>
                        <th style={{ padding:'10px 12px', textAlign:'right' }}>Rate</th>
                        <th style={{ padding:'10px 12px', textAlign:'right', borderRadius:'0 8px 0 0' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nights > 0 && (
                        <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                          <td style={{ padding:'10px 12px' }}><strong>Hotel Rooms</strong><br/><span style={{fontSize:'11px',color:'#6B7280'}}>{quote.logistics.rooms} rooms × {nights} nights</span></td>
                          <td style={{ padding:'10px 12px', textAlign:'center' }}>{quote.logistics.rooms}</td>
                          <td style={{ padding:'10px 12px', textAlign:'right' }}>{fmt(config.room.sell)}/room/night</td>
                          <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:600 }}>{fmt(quote.logistics.roomSell)}</td>
                        </tr>
                      )}
                      <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                        <td style={{ padding:'10px 12px' }}><strong>Transport (Jeeps)</strong><br/><span style={{fontSize:'11px',color:'#6B7280'}}>{quote.logistics.jeeps} jeeps × {form.days} days</span></td>
                        <td style={{ padding:'10px 12px', textAlign:'center' }}>{quote.logistics.jeeps}</td>
                        <td style={{ padding:'10px 12px', textAlign:'right' }}>{fmt(config.jeep.sell)}/jeep/day</td>
                        <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:600 }}>{fmt(quote.logistics.jeepSell)}</td>
                      </tr>
                      <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                        <td style={{ padding:'10px 12px' }}><strong>Food Package</strong><br/><span style={{fontSize:'11px',color:'#6B7280'}}>{form.pax} pax × {form.days} days</span></td>
                        <td style={{ padding:'10px 12px', textAlign:'center' }}>{form.pax}</td>
                        <td style={{ padding:'10px 12px', textAlign:'right' }}>{fmt(config.food.sell)}/pax/day</td>
                        <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:600 }}>{fmt(quote.logistics.foodSell)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ background:'#F0F9FF' }}>
                        <td colSpan="3" style={{ padding:'12px', fontWeight:800, fontSize:'15px' }}>TOTAL AMOUNT</td>
                        <td style={{ padding:'12px', textAlign:'right', fontWeight:800, fontSize:'18px', color:'#2563EB' }}>{fmt(sellPrice)}</td>
                      </tr>
                      <tr style={{ background:'#F8FAFC' }}>
                        <td colSpan="3" style={{ padding:'8px 12px', fontSize:'12px', color:'#6B7280' }}>Per Person</td>
                        <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:600, fontSize:'14px' }}>{fmt(Math.round(sellPrice/form.pax))}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Terms */}
                  <div style={{ fontSize:'11px', color:'#6B7280', marginBottom:'20px', padding:'12px', background:'#F8FAFC', borderRadius:'8px', border:'1px solid #E5E7EB' }}>
                    <div style={{ fontWeight:700, marginBottom:'6px', color:'#374151' }}>Terms & Conditions:</div>
                    <div>• 50% advance required at time of booking confirmation</div>
                    <div>• Balance amount due 7 days before travel date</div>
                    <div>• Cancellation charges apply as per company policy</div>
                    <div>• Prices valid for 7 days from date of quotation</div>
                    <div>• GST extra as applicable</div>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign:'center', paddingTop:'16px', borderTop:'2px solid #2563EB', fontSize:'11px', color:'#6B7280' }}>
                    <div style={{ fontWeight:700, color:'#1E3A5F', fontSize:'13px' }}>Pakka Tourism Pvt. Ltd.</div>
                    <div>📍 Mall Road, Manali, HP 175131 · 📞 +91 98765 43210 · ✉️ info@pakkatourism.com</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
