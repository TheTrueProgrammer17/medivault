import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Emergency() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwner = currentUser?.uid === userId;

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (snap.exists()) {
          setData(snap.data());
        } else {
          setError('No medical profile found for this ID.');
        }
      } catch (err) {
        setError('Unable to load emergency data.');
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) {
    return <div className="loading-page"><div className="spinner"></div><span>Loading emergency data...</span></div>;
  }

  if (error) {
    return (
      <div className="emergency-page">
        <div style={{ maxWidth: '460px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '8px' }}>{error}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This QR code may be invalid or the user has not set up their profile yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-page">
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        {/* Header */}
        <div className="emergency-header fade-in">
          <div className="emergency-badge">🚨 EMERGENCY MEDICAL INFO</div>
          <h1>{data.name || 'Patient'}</h1>
          <p>Last updated: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'Unknown'}</p>
        </div>

        {/* Blood Group */}
        <div className="emergency-section fade-in fade-in-delay-1">
          <h2>🩸 Vital Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="label">Blood Group</div>
              <div className="value blood">{data.bloodGroup || 'Not specified'}</div>
            </div>
            <div className="info-item">
              <div className="label">Conditions</div>
              <div className="value">{data.conditions?.length ? data.conditions.join(', ') : 'None listed'}</div>
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="emergency-section fade-in fade-in-delay-2">
          <h2>⚠️ Allergies</h2>
          {data.allergies?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.allergies.map((a, i) => (
                <span key={i} className="tag tag-danger" style={{ fontSize: '0.9rem', padding: '8px 18px' }}>{a}</span>
              ))}
            </div>
          ) : (
            <div className="info-item"><div className="value">No known allergies</div></div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="emergency-section fade-in fade-in-delay-3">
          <h2>📞 Emergency Contacts</h2>
          {data.contacts?.length ? (
            data.contacts.map((c, i) => (
              <div key={i} className="contact-card">
                <div className="contact-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <div className="contact-info">
                  <div className="name">{c.name}</div>
                  <div className="relation">{c.relation || 'Contact'}</div>
                </div>
                <div className="contact-phone">
                  <a href={`tel:${c.phone}`}>{c.phone}</a>
                </div>
              </div>
            ))
          ) : (
            <div className="info-item"><div className="value">No contacts listed</div></div>
          )}
        </div>

        {/* Medical Documents - only if logged in as owner */}
        {isOwner && data.documents?.length > 0 && (
          <div className="emergency-section fade-in">
            <h2>📄 Medical Documents</h2>
            <div className="doc-list">
              {data.documents.map((d, i) => (
                <div key={i} className="doc-item">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <div className="name">{d.name}</div>
                    <div className="meta">{new Date(d.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notice for non-owners */}
        {!isOwner && (
          <div className="card fade-in" style={{ marginTop: '20px', textAlign: 'center', padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              🔒 Full medical documents are only visible to the account owner.
              <br />
              <Link to="/login" style={{ marginTop: '8px', display: 'inline-block' }}>Login to view full records</Link>
            </p>
          </div>
        )}

        <footer className="footer" style={{ marginTop: '32px' }}>
          <p>Powered by <Link to="/">MediVault</Link></p>
        </footer>
      </div>
    </div>
  );
}
