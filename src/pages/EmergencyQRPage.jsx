import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function EmergencyQRPage() {
  const { currentUser } = useAuth();
  const [msg, setMsg] = useState('');

  const qrUrl = currentUser ? `${window.location.origin}/emergency/${currentUser.uid}` : '';

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Emergency QR</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your emergency access code for first responders</p>
      </div>

      {msg && <div className="alert alert-success">✓ {msg}</div>}

      <div className="card fade-in">
        <div className="card-header" style={{ textAlign: 'center' }}>
          <h2>Your Personal QR Code</h2>
          <p>Print or share this code. When scanned, it provides immediate access to your critical health data.</p>
        </div>
        <div className="qr-container">
          <div className="qr-wrapper">
            <QRCodeSVG value={qrUrl} size={250} level="H" includeMargin={true} fgColor="#0F172A" bgColor="#FFFFFF" />
          </div>
          <p className="qr-instruction" style={{ marginBottom: '20px' }}>
            First responders can scan this code with any smartphone camera to view your blood group, allergies, and emergency contacts.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(qrUrl); flash('Link copied to clipboard!'); }}>
              📋 Copy Link
            </button>
            <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              🔗 Preview Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
