import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';

const STAGES = ['new_inquiry','in_progress','quote_sent','advance_pending','confirmed','finished','lost'];
const STAGE_LABELS = {
  new_inquiry:'New Inquiry', in_progress:'In Progress', quote_sent:'Quote Sent',
  advance_pending:'Advance Pending', confirmed:'Confirmed', finished:'Finished', lost:'Lost'
};
const STAGE_COLORS = {
  new_inquiry:'#60A5FA', in_progress:'#A78BFA', quote_sent:'#FBBF24',
  advance_pending:'#FB923C', confirmed:'#34D399', finished:'#94A3B8', lost:'#F87171'
};
const PRIORITY_BADGE = {
  urgent:{ bg:'#FEF2F2', color:'#DC2626', border:'#FEE2E2' },
  high:  { bg:'#FFFBEB', color:'#D97706', border:'#FDE68A' },
  medium:{ bg:'#EFF6FF', color:'#2563EB', border:'#BFDBFE' },
  low:   { bg:'#F1F5F9', color:'#64748B', border:'#E2E8F0' },
};
const SOURCE_ICON = { whatsapp:'💬', phone:'📞', website:'🌐', referral:'🤝', indiamart:'🛒', google:'🔍', social:'📱', walk_in:'🚶', other:'📧' };

const MOCK_LEADS = [
  { _id:'1', clientName:'Rajesh Kumar', phone:'9876543210', destination:'Manali', travelDate:'2025-06-15', pax:8, priority:'urgent', source:'whatsapp', aiScore:87, stage:'new_inquiry', nextFollowUp:'Tomorrow', budget:85000 },
  { _id:'2', clientName:'Priya Sharma', phone:'9812345678', destination:'Kerala Backwaters', travelDate:'2025-07-10', pax:4, priority:'high', source:'referral', aiScore:76, stage:'new_inquiry', nextFollowUp:'Today 3pm', budget:62000 },
  { _id:'3', clientName:'Amit & Family', phone:'9900112233', destination:'Rajasthan', travelDate:'2025-06-28', pax:6, priority:'medium', source:'indiamart', aiScore:61, stage:'in_progress', nextFollowUp:'May 28', budget:48000 },
  { _id:'4', clientName:'Corporate Group', phone:'9123456780', destination:'Goa', travelDate:'2025-08-05', pax:22, priority:'urgent', source:'website', aiScore:92, stage:'in_progress', nextFollowUp:'Today 5pm', budget:220000 },
  { _id:'5', clientName:'Suresh Travels', phone:'9988776655', destination:'Himachal', travelDate:'2025-06-20', pax:15, priority:'high', source:'phone', aiScore:78, stage:'quote_sent', nextFollowUp:'May 27', budget:180000 },
  { _id:'6', clientName:'Meena Iyer',    phone:'9871234560', destination:'Coorg', travelDate:'2025-07-01', pax:2, priority:'medium', source:'google', aiScore:55, stage:'quote_sent', nextFollowUp:'May 30', budget:22000 },
  { _id:'7', clientName:'Rohit & Party', phone:'9012345678', destination:'Shimla', travelDate:'2025-06-12', pax:12, priority:'high', source:'referral', aiScore:81, stage:'advance_pending', nextFollowUp:'Urgent', budget:144000 },
  { _id:'8', clientName:'Anjali Verma',  phone:'9456123780', destination:'Manali', travelDate:'2025-06-18', pax:3, priority:'medium', source:'whatsapp', aiScore:64, stage:'confirmed', nextFollowUp:'Jun 15', budget:36000 },
  { _id:'9', clientName:'Tech Corp Ltd', phone:'9900009988', destination:'International', travelDate:'2025-09-10', pax:30, priority:'urgent', source:'website', aiScore:95, stage:'confirmed', nextFollowUp:'Jun 1', budget:900000 },
  { _id:'10',clientName:'Kavita Nair',   phone:'9134500000', destination:'Pondicherry', travelDate:'2025-07-22', pax:5, priority:'low', source:'social', aiScore:32, stage:'lost', nextFollowUp:'—', budget:30000 },
];

function LeadCard({ lead, onMove }) {
  const pb = PRIORITY_BADGE[lead.priority];
  return (
    <div className="kanban-card" draggable>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
        <div>
          <div className="kanban-card-title">{lead.clientName}</div>
          <div className="kanban-card-meta">📍 {lead.destination}</div>
        </div>
        <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'99px',
          background: pb.bg, color: pb.color, border:`1px solid ${pb.border}`, flexShrink:0 }}>
          {lead.priority.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px', fontSize:'11px', color:'var(--color-text-muted)', marginBottom:'8px' }}>
        <span>🗓 {new Date(lead.travelDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</span>
        <span>👥 {lead.pax} pax</span>
        <span>{SOURCE_ICON[lead.source]} {lead.source}</span>
        <span style={{ color:'var(--color-text-primary)', fontWeight:600 }}>₹{(lead.budget/1000).toFixed(0)}K</span>
      </div>

      {/* AI Score */}
      <div style={{ marginBottom:'8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
          <span style={{ fontSize:'10px', color:'var(--color-text-muted)' }}>AI Score</span>
          <span style={{ fontSize:'10px', fontWeight:700, color: lead.aiScore>=75?'#059669':lead.aiScore>=50?'#D97706':'#DC2626' }}>{lead.aiScore}%</span>
        </div>
        <div className="progress-wrap" style={{ height:'3px' }}>
          <div style={{ height:'100%', borderRadius:'99px', transition:'width 0.5s',
            width:`${lead.aiScore}%`,
            background: lead.aiScore>=75?'#10B981':lead.aiScore>=50?'#F59E0B':'#EF4444'
          }}/>
        </div>
      </div>

      {/* Follow-up */}
      <div style={{ fontSize:'10px', background:'var(--color-bg-secondary)', padding:'4px 8px', borderRadius:'6px', marginBottom:'8px', color:'var(--color-text-muted)' }}>
        ⏰ Follow-up: <strong style={{ color:'var(--color-text-primary)' }}>{lead.nextFollowUp}</strong>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'4px', justifyContent:'flex-end' }}>
        <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noreferrer">
          <button className="btn btn-ghost btn-xs" style={{ padding:'4px 8px', fontSize:'11px', color:'#25D366' }} title="WhatsApp">💬</button>
        </a>
        <a href={`tel:${lead.phone}`}>
          <button className="btn btn-ghost btn-xs" style={{ padding:'4px 8px', fontSize:'11px' }} title="Call">📞</button>
        </a>
        <button className="btn btn-ghost btn-xs" style={{ padding:'4px 8px', fontSize:'11px' }} title="Edit">✏️</button>
      </div>
    </div>
  );
}

export default function LeadPipeline() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [showAdd, setShowAdd] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.clientName.toLowerCase().includes(search.toLowerCase()) || l.destination.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'all' || l.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const byStage = (stage) => filtered.filter(l => l.stage === stage);
  const totalValue = leads.reduce((s,l) => s + l.budget, 0);
  const confirmedValue = leads.filter(l => l.stage === 'confirmed').reduce((s,l) => s + l.budget, 0);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 className="page-title">Lead Pipeline</h1>
          <p className="page-sub">
            {leads.length} leads · Pipeline value: <strong>₹{(totalValue/100000).toFixed(1)}L</strong> · Confirmed: <strong style={{ color:'var(--color-success)' }}>₹{(confirmedValue/100000).toFixed(1)}L</strong>
          </p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="search-input" placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="form-select" style={{ width:'auto', padding:'7px 12px' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Lead</button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {STAGES.map(stage => {
          const cards = byStage(stage);
          const stageValue = cards.reduce((s,l) => s + l.budget, 0);
          return (
            <div key={stage} className="kanban-col">
              <div className="kanban-col-header">
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: STAGE_COLORS[stage], flexShrink:0 }}/>
                  <div className="kanban-col-title">{STAGE_LABELS[stage]}</div>
                </div>
                <span className="kanban-col-count">{cards.length}</span>
              </div>
              {stageValue > 0 && (
                <div style={{ padding:'0 8px 8px', fontSize:'10px', color:'var(--color-text-muted)' }}>
                  ₹{(stageValue/1000).toFixed(0)}K pipeline
                </div>
              )}
              <div className="kanban-cards">
                {cards.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'20px 8px', fontSize:'11px', color:'var(--color-text-muted)', border:'1px dashed var(--color-border)', borderRadius:'10px' }}>
                    No leads
                  </div>
                ) : (
                  cards.map(lead => <LeadCard key={lead._id} lead={lead}/>)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          position:'fixed', bottom:'28px', right:'28px',
          width:'52px', height:'52px', borderRadius:'50%', border:'none',
          background:'linear-gradient(135deg,#2563EB,#1D4ED8)', color:'#fff',
          fontSize:'24px', cursor:'pointer', boxShadow:'0 8px 24px rgba(37,99,235,0.4)',
          display:'grid', placeItems:'center', zIndex:100,
          transition:'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={e => { e.target.style.transform='scale(1.1)'; e.target.style.boxShadow='0 12px 32px rgba(37,99,235,0.5)'; }}
        onMouseLeave={e => { e.target.style.transform='scale(1)'; e.target.style.boxShadow='0 8px 24px rgba(37,99,235,0.4)'; }}
        title="Add New Lead"
      >+</button>

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Lead</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Client Name *</label><input className="form-input" placeholder="Rajesh Kumar"/></div>
                <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" placeholder="9876543210"/></div>
                <div className="form-group"><label className="form-label">Destination *</label><input className="form-input" placeholder="Manali, HP"/></div>
                <div className="form-group"><label className="form-label">Travel Date</label><input type="date" className="form-input"/></div>
                <div className="form-group"><label className="form-label">Pax Count</label><input type="number" className="form-input" placeholder="4" min="1"/></div>
                <div className="form-group"><label className="form-label">Budget (₹)</label><input type="number" className="form-input" placeholder="50000"/></div>
                <div className="form-group"><label className="form-label">Source</label>
                  <select className="form-select">
                    {Object.keys(SOURCE_ICON).map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Priority</label>
                  <select className="form-select">
                    <option value="medium">Medium</option><option value="high">High</option>
                    <option value="urgent">Urgent</option><option value="low">Low</option>
                  </select>
                </div>
                <div className="form-group full"><label className="form-label">Notes</label><textarea className="form-textarea" placeholder="Any special requirements…"/></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowAdd(false)}>💾 Save Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
