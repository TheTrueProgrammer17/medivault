import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DoctorDashboard from './DoctorDashboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const { currentUser, userData } = useAuth();
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!currentUser || userData?.role === 'doctor') return;

    const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setDocuments(docSnap.data().documents || []);
      }
    });

    return () => {
      unsubUser();
    };
  }, [currentUser, userData]);

  if (userData?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  // Count verified documents
  const verifiedCount = documents.filter(d => d.verificationStatus === 'verified').length;
  const pendingCount = documents.filter(d => d.verificationStatus !== 'verified').length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
          Welcome, {currentUser?.displayName || 'User'}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Your central hub for managing medical information.
        </p>
      </div>

      {/* Quick Stats */}
      {documents.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{documents.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Documents</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#065F46' }}>{verifiedCount}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Verified</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#9A3412' }}>{pendingCount}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending</div>
          </div>
        </div>
      )}

      <div className="features">
        <Link to="/profile" className="card feature-card fade-in" style={{ textDecoration: 'none' }}>
          <div className="feature-icon">🩺</div>
          <h3>Medical Profile</h3>
          <p>Update your blood group, allergies, conditions, and emergency contacts.</p>
        </Link>
        <Link to="/family" className="card feature-card fade-in fade-in-delay-1" style={{ textDecoration: 'none' }}>
          <div className="feature-icon">👨‍👩‍👧‍👦</div>
          <h3>Family Dashboard</h3>
          <p>Manage emergency profiles for your family members in one place.</p>
        </Link>
        <Link to="/documents" className="card feature-card fade-in fade-in-delay-2" style={{ textDecoration: 'none' }}>
          <div className="feature-icon">📄</div>
          <h3>Documents</h3>
          <p>Upload medical documents and generate verification keys for doctors.</p>
        </Link>
        <Link to="/qr" className="card feature-card fade-in fade-in-delay-3" style={{ textDecoration: 'none' }}>
          <div className="feature-icon">📱</div>
          <h3>Emergency QR</h3>
          <p>Get your personal QR code for first responders.</p>
        </Link>
      </div>

      {/* Recently verified documents */}
      {verifiedCount > 0 && (
        <div className="card fade-in" style={{ marginTop: '32px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span> Recently Verified Documents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {documents.filter(d => d.verificationStatus === 'verified').slice(-5).reverse().map((d, idx) => (
              <div key={idx} style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontWeight: '600' }}>{d.documentTitle}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Verified by {d.verifiedByDoctor} {d.verifiedByHospital ? `(${d.verifiedByHospital})` : ''} · {new Date(d.verificationTimestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
