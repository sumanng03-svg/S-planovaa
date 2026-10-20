import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

export default function VerifyTicket() {
  const { ticketRef } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid]     = useState(false);

  useEffect(() => {
    api.get(`/tickets/verify/${ticketRef}`)
      .then(r => { setData(r.data.data); setValid(true); })
      .catch(() => setValid(false))
      .finally(() => setLoading(false));
  }, [ticketRef]);

  if (loading) return (
    <main className="page-wrapper">
      <div className="loading-container" style={{minHeight:'60vh'}}>
        <div className="spinner"/><span>Verifying ticket...</span>
      </div>
    </main>
  );

  return (
    <main className="page-wrapper">
      <div className="container" style={{paddingTop:'calc(var(--nav-height) + 3rem)', maxWidth:'520px', paddingBottom:'4rem'}}>
        {valid && data ? (
          <div className="card" style={{padding:'var(--space-xl)'}}>
            <div style={{textAlign:'center', marginBottom:'var(--space-xl)'}}>
              <div style={{fontSize:'3rem', marginBottom:'var(--space-md)'}}>✅</div>
              <h1 style={{fontSize:'1.5rem', color:'var(--color-success)', fontWeight:800}}>Valid Ticket</h1>
              <p style={{color:'var(--color-text-muted)', fontSize:'0.9rem', marginTop:'4px'}}>This is a legitimate PLANOVA ticket</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'var(--space-sm)',fontSize:'0.92rem'}}>
              {[
                ['Event',    data.event_title],
                ['Attendee', data.attendee_name],
                ['Date',     formatDate(data.event_date)],
                ['Venue',    data.venue],
                ['Tickets',  `${data.quantity} seat${data.quantity>1?'s':''}`],
              ].map(([label,val]) => (
                <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid var(--color-border-soft)'}}>
                  <span style={{color:'var(--color-text-faint)'}}>{label}</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
            <div style={{marginTop:'var(--space-xl)', display:'flex', justifyContent:'center'}}>
              <QRCodeSVG value={`${window.location.origin}/verify/${ticketRef}`} size={100} level="H" fgColor="#f1f5f9" bgColor="transparent" />
            </div>
            <p style={{textAlign:'center',fontSize:'0.72rem',color:'var(--color-text-faint)',marginTop:'var(--space-sm)'}}>Issued by PLANOVA · Plan less. Experience more.</p>
          </div>
        ) : (
          <div className="card" style={{padding:'var(--space-xl)', textAlign:'center'}}>
            <div style={{fontSize:'3rem', marginBottom:'var(--space-md)'}}>❌</div>
            <h1 style={{fontSize:'1.4rem', color:'var(--color-error)', fontWeight:800}}>Invalid Ticket</h1>
            <p style={{color:'var(--color-text-muted)', margin:'var(--space-md) 0'}}>This ticket reference is not valid or does not exist in our system.</p>
            <Link to="/" className="btn btn-outline">Go Home</Link>
          </div>
        )}
      </div>
    </main>
  );
}
